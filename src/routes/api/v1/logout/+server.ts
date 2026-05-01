export function GET({ locals, cookies }): void {
    if(locals.user) {
        locals.user = null;
        cookies.delete('token', { path: '/' });
    }
}
