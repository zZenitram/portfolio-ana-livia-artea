export class FleuryTemplate {
    static async load() {
        try {
            const response = await fetch('src/modules/fleury-component/template.html');
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading Fleury Template:', error);
            throw error;
        }
    }
}
