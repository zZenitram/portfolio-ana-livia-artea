export class ContactMeTemplate {
    static async load() {
        const response = await fetch('src/modules/contact-me-component/template.html');

        if (!response.ok) throw new Error(`Failed to fetch HTML: ${response.status}`);

        return response.text();
    }
}