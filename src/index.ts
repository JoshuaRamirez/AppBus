import AppBusFactory from './app-bus';
export default AppBusFactory;

// Provide CommonJS default export for backward compatibility
if (typeof module !== 'undefined') {
    (module as any).exports = AppBusFactory;
}
