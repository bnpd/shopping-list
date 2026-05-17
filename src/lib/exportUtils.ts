import type { ShoppingItem, Food } from "./types";

function escapeCSVField(input: unknown): string {
    let s = input == null ? '' : String(input);
    s = s.replace(/"/g, '""');
    if (/[,"\n]/.test(s)) return `"${s}"`;
    return s;
}

export function exportProducts(products: ShoppingItem[]) {
    const headers = ['Name','Frequency (days)','Price','Stores','reported','updated','createdDate','id'];
    const rows: string[][] = [headers];

    for (const item of products) {
        const stores = (item.stores || []).join(', ');
        const updated = new Date(item.lastBuyDate).toISOString();
        const created = new Date(item.createdDate).toISOString();

        rows.push([
            item.name,
            String(item.frequency || ''),
            String(item.price),
            stores,
            String(item.reported),
            updated,
            created,
            item.id
        ]);
    }

    downloadAsCSV(rows, 'products-export.csv');
}

function downloadAsCSV(rows: string[][], filename: string) {
    const csv = rows.map(r => r.map(escapeCSVField).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportFoods(foods: Food[], products: ShoppingItem[]) {
    const headers = ['Name','Ingredients','Frequenz (Tage Abstand)','Link','Link 2','Link 3','Tags'];
    const rows: string[][] = [headers];

    for (const food of foods) {
        const ingredientNames = food.productIds
            .map(pid => products.find(it => it.id === pid)?.name || '')
            .filter(Boolean)
            .join(', ');

        const links = (food.links || []).slice(0, 3);
        const tags = (food.tags || []).join(', ');

        const row = [
            food.name,
            ingredientNames,
            String(food.frequency || ''),
            links[0] || '',
            links[1] || '',
            links[2] || '',
            tags
        ];

        rows.push(row);
    }

    downloadAsCSV(rows, 'foods-export.csv');
}