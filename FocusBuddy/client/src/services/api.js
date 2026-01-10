// Backwards compatibility - re-export from new location
// TODO: Update imports in components to use '../api' directly
export * from '../api';
export { authApi } from '../api/endpoints/auth';
export { sessionApi } from '../api/endpoints/sessions';
export { streakApi } from '../api/endpoints/streaks';
export { default } from '../api/client';

