export class BrandsTemplate {
    static async load() {
        const response = await fetch('src/modules/brands-component/template.html');

        if (!response.ok) throw new Error(`Failed to fetch HTML: ${response.status}`);

        return response.text();
    }
}