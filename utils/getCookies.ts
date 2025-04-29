export async function getCookies(url: string): Promise<string>{
    const response = await fetch(url);
    const cookie = response.headers.getSetCookie()[0].split(";")[0];

    return cookie;
}
