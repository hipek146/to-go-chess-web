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

export const openToast = (content: any, options?: any) => ({
    type: 'OPEN_TOAST',
    content,
    options,
});

export const closeToast = () => ({
    type: 'CLOSE_TOAST',
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

export const enableTreeMovement = () => ({
    type: 'TREE_MOVEMENT_ENABLED'
});

export const disableTreeMovement = () => ({
    type: 'TREE_MOVEMENT_DISABLED'
});

export const createAnalysis = (movesPGN?: string) => ({
    type: 'NEW_ANALYSIS',
    movesPGN
});

export const analysisCreated = () => ({
    type: 'ANALYSIS_CREATED',
});

export const drawOffer = () => ({
    type: 'DRAW_OFFERED',
});

export const surrender = () => ({
    type: 'SURRENDERED',
});

export const gameInProgress = () => ({
    type: 'GAME_IN_PROGRESS',
});

export const sendEmote = (index) => ({
    type: 'SEND_EMOTE',
    index
});

export const emoteSent = () => ({
    type: 'EMOTE_SENT'
});

export const rotateChessboard = () => ({
    type: 'CHESSBOARD_ROTATED'
});

export const toggleAutomaticRotation = () => ({
    type: 'TOGGLE_CHESSBOARD_ROTATION'
});