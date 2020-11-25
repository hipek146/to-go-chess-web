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

export const gameTreeUpdated = (gameTree: any) => ({
    type: 'GAME_TREE_UPDATED',
    gameTree
});

export const gameObjectCreated = (game: any) => ({
    type: 'GAME_OBJECT_CREATED',
    game
});