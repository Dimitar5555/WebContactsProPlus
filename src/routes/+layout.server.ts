// Makes the username of the logged-in user available to all pages in the app
export const load = ({ locals }) => {
    return {
        username: locals.user?.username
    };
};
