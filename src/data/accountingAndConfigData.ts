import {
    ChartOfAccount,
    ExpenseHead,
    ProductCategory,
    UserRole,
    RolePermission,
    JournalEntry,
    Project,
    PaymentMethodConfig,
} from '../types';

export const ALL_SYSTEM_PERMISSIONS: RolePermission[] = [
    // POS
    { id: 'perm-pos-1', code: 'pos.view', name: 'View POS Counter', nameBn: "", category: 'POS' },
    { id: 'perm-pos-2', code: 'pos.create_sale', name: 'Create & Print POS Sales', nameBn: "", category: 'POS' },
    { id: 'perm-pos-3', code: 'pos.discount', name: 'Apply Special Discount', nameBn: "Price", category: 'POS' },
    // Sales
    { id: 'perm-sales-1', code: 'sales.view', name: 'View Sales & Quotes', nameBn: "Quotation", category: 'Sales' },
    { id: 'perm-sales-2', code: 'sales.create_invoice', name: 'Create Invoices', nameBn: "Invoice", category: 'Sales' },
    { id: 'perm-sales-3', code: 'sales.edit_invoice', name: 'Edit Invoices', nameBn: "Invoice", category: 'Sales' },
    { id: 'perm-sales-4', code: 'sales.delete_invoice', name: 'Delete Invoices', nameBn: "Invoice", category: 'Sales' },
    { id: 'perm-sales-5', code: 'sales.collect_payment', name: 'Collect Due Payments', nameBn: "Tk", category: 'Sales' },
    { id: 'perm-sales-6', code: 'sales.manage_quotations', name: 'Manage Quotations', nameBn: "Quotation", category: 'Sales' },
    // Inventory
    { id: 'perm-inv-1', code: 'inventory.view', name: 'View Inventory & Stock', nameBn: "Product", category: 'Inventory' },
    { id: 'perm-inv-2', code: 'inventory.add_product', name: 'Add Products & Materials', nameBn: "Product", category: 'Inventory' },
    { id: 'perm-inv-3', code: 'inventory.edit_product', name: 'Edit Product Details', nameBn: "Product", category: 'Inventory' },
    { id: 'perm-inv-4', code: 'inventory.delete_product', name: 'Delete Products', nameBn: "Product", category: 'Inventory' },
    { id: 'perm-inv-5', code: 'inventory.adjust_stock', name: 'Stock Adjustment & Transfer', nameBn: "", category: 'Inventory' },
    { id: 'perm-inv-6', code: 'inventory.manage_categories', name: 'Add/Edit/Delete Categories', nameBn: "", category: 'Inventory' },
    { id: 'perm-inv-7', code: 'inventory.bulk_import', name: 'Bulk Product CSV Import', nameBn: "", category: 'Inventory' },
    // Supply Chain
    { id: 'perm-sup-1', code: 'supply.view', name: 'View Purchase & Suppliers', nameBn: "", category: 'Supply Chain' },
    { id: 'perm-sup-2', code: 'supply.create_po', name: 'Create Purchase Orders', nameBn: "Order", category: 'Supply Chain' },
    { id: 'perm-sup-3', code: 'supply.receive_stock', name: 'Receive Stock Delivery', nameBn: "Factory", category: 'Supply Chain' },
    { id: 'perm-sup-4', code: 'supply.manage_suppliers', name: 'Manage Suppliers', nameBn: "Supplier", category: 'Supply Chain' },
    { id: 'perm-sup-5', code: 'supply.pay_supplier', name: 'Pay Supplier Dues', nameBn: "Supplier Due Payment", category: 'Supply Chain' },
    // Accounting
    { id: 'perm-acc-1', code: 'accounting.view', name: 'View Ledgers & Balances', nameBn: "", category: 'Accounting' },
    { id: 'perm-acc-2', code: 'accounting.add_income', name: 'Record Income', nameBn: "", category: 'Accounting' },
    { id: 'perm-acc-3', code: 'accounting.add_expense', name: 'Record Operating Expenses', nameBn: "", category: 'Accounting' },
    { id: 'perm-acc-4', code: 'accounting.manage_expense_heads', name: 'Manage Expense Heads', nameBn: "", category: 'Accounting' },
    { id: 'perm-acc-5', code: 'accounting.chart_of_accounts', name: 'Manage Chart of Accounts', nameBn: "", category: 'Accounting' },
    { id: 'perm-acc-6', code: 'accounting.export_reports', name: 'Export Financial Reports', nameBn: "Report   Print", category: 'Accounting' },
    // Settings & Configuration
    { id: 'perm-set-1', code: 'settings.view', name: 'Access Configuration Module', nameBn: "", category: 'Settings' },
    { id: 'perm-set-2', code: 'settings.manage_users', name: 'Manage Users & Staff', nameBn: ",", category: 'Settings' },
    { id: 'perm-set-3', code: 'settings.manage_roles', name: 'Configure Roles & Permissions', nameBn: "", category: 'Settings' },
    { id: 'perm-set-4', code: 'settings.clean_data', name: 'Module-wise Data Clean & Purge', nameBn: "", category: 'Settings' },
    { id: 'perm-set-5', code: 'settings.backup_restore', name: 'Database Backup & Restore', nameBn: "", category: 'Settings' },
    { id: 'perm-set-6', code: 'settings.manage_payments', name: 'Manage Payment Gateways & Banking', nameBn: "Payment   Bank", category: 'Settings' },
];

export const INITIAL_USER_ROLES: UserRole[] = [];

export const INITIAL_PRODUCT_CATEGORIES: ProductCategory[] = [];

export const INITIAL_EXPENSE_HEADS: ExpenseHead[] = [];

export const INITIAL_CHART_OF_ACCOUNTS: ChartOfAccount[] = [];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [];