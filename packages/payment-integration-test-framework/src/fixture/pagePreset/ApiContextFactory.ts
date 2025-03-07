import { request, APIRequestContext, Page } from '@playwright/test';

export class ApiContextFactory {
    private apiContext: APIRequestContext | undefined;

    async create(page: Page, storeUrl: string): Promise<APIRequestContext> {
        if (!this.apiContext) {
            await this.setup(page, storeUrl);
        }
        if (this.apiContext) {
            return this.apiContext;
        } else {
            throw new Error(`Api context setup failed. Is ${storeUrl} accessible now?`);
        }
    }

    private async setup(page: Page, storeUrl: string): Promise<void> {
        await page.goto(storeUrl);

        let cookieStr = '';
        let xsrfTokenStr = '';
        const cookies = await page.context().cookies();
        for (const cookie of cookies) {
            if (cookie.name === 'XSRF-TOKEN') {
                xsrfTokenStr = cookie.value;
            }
            cookieStr += `${cookie.name}=${cookie.value};`;
        }

        this.apiContext = await request.newContext({
            baseURL: storeUrl + '/api/storefront/',
            extraHTTPHeaders: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-xsrf-token': xsrfTokenStr,
                cookie: cookieStr,
            },
        });
    }
}
