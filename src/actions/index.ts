export const restoreUser = (user: any) => ({
    type: 'RESTORE_USER',
    user,
});

export const openDialog = (content: any, onClose?: any) => ({
    type: 'OPEN_DIALOG',
    content,
    onClose,
});

export const closeDialog = () => ({
    type: 'CLOSE_DIALOG',
});

export const createGame = (config) => ({
    type: 'NEW_GAME',
    config
});

export const gameCreated = () => ({
    type: 'GAME_CREATED',
});