import { ChartOfAccount, AccountingTransaction, SalesInvoice, PaymentMethodConfig, AccountBalances } from '../types';

/**
 * Normalizes account or channel string for fuzzy matching
 */
export const normalizeChannelKey = (name: string): string => {
    return (name || '').toLowerCase().replace(/[\s\-_()]/g, '');
};

/**
 * Matches a payment method name, channel name, or ID to a specific Chart of Account head
 */
export const matchChannelToAccount = (
    channelNameOrId: string,
    chartOfAccounts: ChartOfAccount[],
    paymentMethods?: PaymentMethodConfig[]
): ChartOfAccount | undefined => {
    if (!channelNameOrId || !chartOfAccounts || chartOfAccounts.length === 0) return undefined;
    const raw = channelNameOrId.trim();
    const lower = raw.toLowerCase();

    // 1. Try matching by exact ID or Code in COA
    let found = chartOfAccounts.find(a => a.id === raw || a.code === raw);
    if (found) return found;

    // 2. Check if channelNameOrId corresponds to a PaymentMethodConfig
    const pm = paymentMethods?.find(p => p.id === raw || p.name.toLowerCase() === lower);
    if (pm?.linkedAccountId) {
        const byLink = chartOfAccounts.find(a => 
            a.id === pm.linkedAccountId || 
            a.code === pm.linkedAccountId || 
            `${a.code} - ${a.name}`.toLowerCase() === pm.linkedAccountId!.toLowerCase() ||
            pm.linkedAccountId!.toLowerCase().includes(a.code)
        );
        if (byLink) return byLink;
    }

    // 3. Match by exact account name or Bengali name
    found = chartOfAccounts.find(a => a.name.toLowerCase() === lower || (a.nameBn && a.nameBn.toLowerCase() === lower));
    if (found) return found;

    // 4. Specific MFS matching (strictly distinguish bKash vs Nagad vs Rocket vs Upay)
    if (lower.includes('bkash') || lower.includes('বিকাশ')) {
        const bkashAcc = chartOfAccounts.find(a => 
            (a.name.toLowerCase().includes('bkash') || a.nameBn?.includes('বিকাশ')) && 
            !a.name.toLowerCase().includes('nagad') && 
            !a.nameBn?.includes('নগদ')
        );
        if (bkashAcc) return bkashAcc;
    }
    if (lower.includes('nagad') || lower.includes('নগদ')) {
        const nagadAcc = chartOfAccounts.find(a => 
            (a.name.toLowerCase().includes('nagad') || a.nameBn?.includes('নগদ')) && 
            !a.name.toLowerCase().includes('bkash') && 
            !a.nameBn?.includes('বিকাশ')
        );
        if (nagadAcc) return nagadAcc;
    }
    if (lower.includes('rocket') || lower.includes('রকেট')) {
        const rocketAcc = chartOfAccounts.find(a => a.name.toLowerCase().includes('rocket') || a.nameBn?.includes('রকেট'));
        if (rocketAcc) return rocketAcc;
    }
    if (lower.includes('upay') || lower.includes('উপায়')) {
        const upayAcc = chartOfAccounts.find(a => a.name.toLowerCase().includes('upay') || a.nameBn?.includes('উপায়'));
        if (upayAcc) return upayAcc;
    }

    // 5. Specific Bank matching
    if (lower.includes('city') || (pm?.bankName && pm.bankName.toLowerCase().includes('city'))) {
        const cityAcc = chartOfAccounts.find(a => a.name.toLowerCase().includes('city'));
        if (cityAcc) return cityAcc;
    }
    if (lower.includes('southeast') || (pm?.bankName && pm.bankName.toLowerCase().includes('southeast'))) {
        const seAcc = chartOfAccounts.find(a => a.name.toLowerCase().includes('southeast'));
        if (seAcc) return seAcc;
    }
    if (lower.includes('brac') || (pm?.bankName && pm.bankName.toLowerCase().includes('brac'))) {
        const bracAcc = chartOfAccounts.find(a => a.name.toLowerCase().includes('brac'));
        if (bracAcc) return bracAcc;
    }
    if (pm?.bankName) {
        const byBank = chartOfAccounts.find(a => a.name.toLowerCase().includes(pm.bankName!.toLowerCase()));
        if (byBank) return byBank;
    }

    // 6. Cash matching
    if (lower.includes('cash') || lower.includes('ক্যাশ')) {
        const cashAcc = chartOfAccounts.find(a => 
            (a.name.toLowerCase().includes('cash') || a.nameBn?.includes('নগদ') || a.code === '1001' || a.code === '1010') &&
            !a.name.toLowerCase().includes('bkash') &&
            !a.name.toLowerCase().includes('nagad')
        );
        if (cashAcc) return cashAcc;
    }

    // 7. General partial name match within Asset classification
    found = chartOfAccounts.find(a => 
        a.classification === 'Asset' && (
            a.name.toLowerCase().includes(lower) || 
            lower.includes(a.name.toLowerCase())
        )
    );
    if (found) return found;

    return undefined;
};

/**
 * Checks whether an AccountingTransaction matches a specific ChartOfAccount head
 */
export const doesTransactionMatchAccount = (
    tx: AccountingTransaction,
    acc: ChartOfAccount
): boolean => {
    const accNameLower = (acc.name || '').toLowerCase().trim();
    const accCode = (acc.code || '').trim();
    const payAcc = (tx.paymentAccount || '').toLowerCase().trim();
    const head = (tx.accountHead || '').toLowerCase().trim();
    const desc = (tx.description || '').toLowerCase();

    // 1. Exact match by account name or code
    if (payAcc === accNameLower || head === accNameLower) return true;
    if (accCode && (payAcc === accCode || head === accCode || payAcc.startsWith(accCode + ' ') || head.startsWith(accCode + ' '))) return true;

    const isBkash = accNameLower.includes('bkash') || (acc.nameBn && acc.nameBn.includes('বিকাশ'));
    const isNagad = accNameLower.includes('nagad') || (acc.nameBn && acc.nameBn.includes('নগদ'));
    const isCity = accNameLower.includes('city');
    const isSoutheast = accNameLower.includes('southeast');
    const isBrac = accNameLower.includes('brac');
    const isCash = (accNameLower.includes('cash') || accCode === '1001' || accCode === '1010' || (acc.nameBn && acc.nameBn.includes('ক্যাশ'))) && !isBkash && !isNagad;

    // 2. Strict MFS separation
    if (isBkash) {
        if (payAcc.includes('bkash') || head.includes('bkash') || desc.includes('bkash')) {
            if (payAcc.includes('nagad') || head.includes('nagad') || desc.includes('nagad')) {
                // If generic "bkash / nagad", check if description says bkash specifically
                return desc.includes('bkash') || !desc.includes('nagad');
            }
            return true;
        }
        return false;
    }

    if (isNagad) {
        if (payAcc.includes('nagad') || head.includes('nagad') || desc.includes('nagad')) {
            if (payAcc.includes('bkash') || head.includes('bkash') || desc.includes('bkash')) {
                return desc.includes('nagad');
            }
            return true;
        }
        return false;
    }

    // 3. Strict Bank separation
    if (isCity) {
        return payAcc.includes('city') || head.includes('city') || desc.includes('city');
    }

    if (isSoutheast) {
        return payAcc.includes('southeast') || head.includes('southeast') || desc.includes('southeast');
    }

    if (isBrac) {
        return (payAcc.includes('brac') || head.includes('brac') || desc.includes('brac')) && !isCity && !isSoutheast;
    }

    // 4. Cash separation
    if (isCash) {
        const isOtherChannel = payAcc.includes('bank') || payAcc.includes('bkash') || payAcc.includes('nagad') || payAcc.includes('city') || payAcc.includes('southeast') || payAcc.includes('card');
        if (!isOtherChannel) {
            return payAcc.includes('cash') || payAcc === 'office cash' || payAcc === 'factory cash' || head.includes('cash') || payAcc === '';
        }
        return false;
    }

    // 5. General partial match
    if (acc.classification === 'Asset') {
        if (payAcc && (accNameLower.includes(payAcc) || payAcc.includes(accNameLower))) return true;
        if (head && (accNameLower.includes(head) || head.includes(accNameLower))) return true;
    }

    return false;
};

/**
 * Calculates the exact dynamic live balance for any asset account in Chart of Accounts
 */
export const calculateSingleAccountBalance = (
    acc: ChartOfAccount,
    transactions: AccountingTransaction[],
    invoices: SalesInvoice[] = []
): number => {
    let balance = Number(acc.openingBalance) || 0;

    const accNameLower = (acc.name || '').toLowerCase().trim();
    const accCode = (acc.code || '').trim();
    const isBkash = accNameLower.includes('bkash') || (acc.nameBn && acc.nameBn.includes('বিকাশ'));
    const isNagad = accNameLower.includes('nagad') || (acc.nameBn && acc.nameBn.includes('নগদ'));
    const isCity = accNameLower.includes('city');
    const isSoutheast = accNameLower.includes('southeast');
    const isBrac = accNameLower.includes('brac');
    const isCash = (accNameLower.includes('cash') || accCode === '1001' || accCode === '1010' || (acc.nameBn && acc.nameBn.includes('ক্যাশ'))) && !isBkash && !isNagad;

    // 1. Sum up all matched ledger transactions
    (transactions || []).forEach((tx) => {
        if (doesTransactionMatchAccount(tx, acc)) {
            if (tx.type === 'INCOME') {
                balance += tx.amount;
            } else if (tx.type === 'EXPENSE') {
                balance -= tx.amount;
            }
        }
    });

    // 2. Reconcile sales invoices with splitPayments or paymentMethod that might not have a ledger tx record
    const recordedInvoiceRefs = new Set(
        (transactions || [])
            .filter((t) => t.type === 'INCOME' && t.refNo)
            .map((t) => (t.refNo || '').toLowerCase().trim())
    );

    (invoices || []).forEach((inv) => {
        const invRef = (inv.invoiceNo || '').toLowerCase().trim();
        if (invRef && recordedInvoiceRefs.has(invRef)) {
            return; // Already accounted for in transactions
        }

        if (inv.splitPayments) {
            Object.entries(inv.splitPayments).forEach(([key, val]) => {
                const kLower = key.toLowerCase();
                const amt = Number(val) || 0;
                if (amt <= 0 || kLower === 'due') return;

                let matchesKey = false;
                if (kLower === accNameLower || (accCode && kLower.includes(accCode))) {
                    matchesKey = true;
                } else if (isBkash && (kLower.includes('bkash') || kLower === 'pm-bkash')) {
                    matchesKey = true;
                } else if (isNagad && (kLower.includes('nagad') || kLower === 'pm-nagad')) {
                    matchesKey = true;
                } else if (isCity && kLower.includes('city')) {
                    matchesKey = true;
                } else if (isSoutheast && kLower.includes('southeast')) {
                    matchesKey = true;
                } else if (isCash && (kLower.includes('cash') || kLower === 'pm-cash')) {
                    matchesKey = true;
                }

                if (matchesKey) {
                    balance += amt;
                }
            });
        } else if ((inv.paidAmount || 0) > 0) {
            const pmLower = (inv.paymentMethod || '').toLowerCase();
            let matchesPm = false;
            if (pmLower === accNameLower || (accCode && pmLower.includes(accCode))) {
                matchesPm = true;
            } else if (isBkash && pmLower.includes('bkash')) {
                matchesPm = true;
            } else if (isNagad && pmLower.includes('nagad')) {
                matchesPm = true;
            } else if (isCity && pmLower.includes('city')) {
                matchesPm = true;
            } else if (isSoutheast && pmLower.includes('southeast')) {
                matchesPm = true;
            } else if (isCash && (pmLower.includes('cash') || pmLower === '')) {
                matchesPm = true;
            }

            if (matchesPm) {
                balance += Number(inv.paidAmount) || 0;
            }
        }
    });

    return Math.max(0, balance);
};

/**
 * Calculates live balance for a PaymentMethodConfig item dynamically
 */
export const getPaymentMethodLiveBalance = (
    pm: PaymentMethodConfig,
    chartOfAccounts: ChartOfAccount[] = [],
    transactions: AccountingTransaction[] = [],
    invoices: SalesInvoice[] = [],
    accountBalances?: AccountBalances
): number => {
    // 1. Try to find the exact linked or matching account head in Chart of Accounts
    const matchingAcc = matchChannelToAccount(pm.name, chartOfAccounts, [pm]);
    if (matchingAcc) {
        return calculateSingleAccountBalance(matchingAcc, transactions, invoices);
    }

    // 2. If no COA head matched, compute directly from transactions & invoices matching this payment method
    let liveAmt = 0;
    const pmLower = pm.name.toLowerCase();

    (transactions || []).forEach((tx) => {
        const pAcc = (tx.paymentAccount || '').toLowerCase();
        const head = (tx.accountHead || '').toLowerCase();
        if (pAcc === pmLower || head === pmLower || pAcc.includes(pmLower)) {
            if (tx.type === 'INCOME') liveAmt += tx.amount;
            else if (tx.type === 'EXPENSE') liveAmt -= tx.amount;
        }
    });

    // 3. Fallback based on payment type
    if (liveAmt === 0 && accountBalances) {
        if (pm.type === 'cash') return (accountBalances.cash || 0) + (accountBalances.factoryCash || 0);
        if (pm.type === 'mfs') {
            if (pmLower.includes('bkash')) return accountBalances.bkash ?? accountBalances.mobile ?? 0;
            if (pmLower.includes('nagad')) return accountBalances.nagad ?? 0;
            return accountBalances.mobile || 0;
        }
        if (pm.type === 'bank') return accountBalances.bank || 0;
    }

    return Math.max(0, liveAmt);
};

/**
 * Extracts bank accounts with their individual balances
 */
export const getBankAccountsBreakdown = (
    chartOfAccounts: ChartOfAccount[] = [],
    transactions: AccountingTransaction[] = [],
    invoices: SalesInvoice[] = []
): Array<{ id: string; code: string; name: string; balance: number }> => {
    const isMobile = (name: string) => {
        const n = name.toLowerCase();
        return n.includes('bkash') || n.includes('nagad') || n.includes('rocket') || n.includes('wallet') || n.includes('mobile') || n.includes('mfs') || n.includes('বিকাশ') || n.includes('নগদ');
    };

    const isBank = (acc: ChartOfAccount) => {
        if (acc.classification !== 'Asset') return false;
        if (isMobile(acc.name)) return false;
        const n = acc.name.toLowerCase();
        return n.includes('bank') || n.includes('plc') || n.includes('city') || n.includes('southeast') || n.includes('brac') || n.includes('eastern') || n.includes('ব্যাংক') || acc.code === '1004' || acc.code === '1005' || acc.code === '1020' || acc.code === '1030';
    };

    const bankAccs = chartOfAccounts.filter(isBank);
    return bankAccs.map((acc) => ({
        id: acc.id,
        code: acc.code,
        name: acc.name,
        balance: calculateSingleAccountBalance(acc, transactions, invoices),
    }));
};

/**
 * Extracts MFS accounts with their individual balances
 */
export const getMfsAccountsBreakdown = (
    chartOfAccounts: ChartOfAccount[] = [],
    transactions: AccountingTransaction[] = [],
    invoices: SalesInvoice[] = []
): {
    bkash: number;
    nagad: number;
    total: number;
    accounts: Array<{ id: string; code: string; name: string; balance: number }>;
} => {
    const isMfs = (acc: ChartOfAccount) => {
        if (acc.classification !== 'Asset') return false;
        const n = acc.name.toLowerCase();
        return n.includes('bkash') || n.includes('nagad') || n.includes('rocket') || n.includes('wallet') || n.includes('mobile') || n.includes('mfs') || n.includes('বিকাশ') || n.includes('নগদ') || acc.code === '1006' || acc.code === '1007' || acc.code === '1040';
    };

    const mfsAccs = chartOfAccounts.filter(isMfs);
    let bkash = 0;
    let nagad = 0;
    const accounts = mfsAccs.map((acc) => {
        const bal = calculateSingleAccountBalance(acc, transactions, invoices);
        const n = acc.name.toLowerCase();
        if (n.includes('bkash') || (acc.nameBn && acc.nameBn.includes('বিকাশ'))) {
            bkash += bal;
        } else if (n.includes('nagad') || (acc.nameBn && acc.nameBn.includes('নগদ'))) {
            nagad += bal;
        }
        return {
            id: acc.id,
            code: acc.code,
            name: acc.name,
            balance: bal,
        };
    });

    return {
        bkash,
        nagad,
        total: bkash + nagad,
        accounts,
    };
};

/**
 * Extracts Cash accounts with their individual balances
 */
export const getCashAccountsBreakdown = (
    chartOfAccounts: ChartOfAccount[] = [],
    transactions: AccountingTransaction[] = [],
    invoices: SalesInvoice[] = []
): {
    total: number;
    officeCash: number;
    factoryCash: number;
    accounts: Array<{ id: string; code: string; name: string; balance: number }>;
} => {
    const isCash = (acc: ChartOfAccount) => {
        if (acc.classification !== 'Asset') return false;
        const n = acc.name.toLowerCase();
        if (n.includes('bkash') || n.includes('nagad') || n.includes('rocket') || n.includes('bank') || n.includes('plc')) return false;
        return (
            n.includes('cash') ||
            (acc.nameBn && acc.nameBn.includes('ক্যাশ')) ||
            n.includes('counter') ||
            n.includes('drawer') ||
            acc.code === '1001' ||
            acc.code === '1010' ||
            acc.code === '1020'
        );
    };

    const cashAccs = chartOfAccounts.filter(isCash);
    let officeCash = 0;
    let factoryCash = 0;
    let total = 0;
    const accounts = cashAccs.map((acc) => {
        const bal = calculateSingleAccountBalance(acc, transactions, invoices);
        total += bal;
        const n = acc.name.toLowerCase();
        if (n.includes('factory') || acc.code === '1020') {
            factoryCash += bal;
        } else {
            officeCash += bal;
        }
        return {
            id: acc.id,
            code: acc.code,
            name: acc.name,
            balance: bal,
        };
    });

    return {
        total,
        officeCash,
        factoryCash,
        accounts,
    };
};
