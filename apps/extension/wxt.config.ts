import { defineConfig } from 'wxt';
export default defineConfig({ modules: ['@wxt-dev/module-react'], manifest: { name: 'Visual Feedback', description: 'Start a user-authorized visual review session.', permissions: ['storage', 'activeTab', 'scripting'], action: { default_title: 'Visual Feedback' } } });
