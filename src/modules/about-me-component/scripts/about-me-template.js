export class AboutMeTemplate {
    static async load() {
        const response = await fetch('src/modules/about-me-component/template.html');

        if (!response.ok) throw new Error(`Failed to fetch HTML: ${response.status}`);

        return response.text();
    }
}