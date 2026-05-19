export class AdidasTemplate {
    static async load() {
        try {
            const response = await fetch('src/modules/adidas-component/template.html');
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading Adidas Template:', error);
            throw error;
        }
    }
}
