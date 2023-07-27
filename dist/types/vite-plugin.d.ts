import { Plugin } from 'vite';
export interface ZiggyPluginConfig {
    /**
     * Issue the command using laravel sail. Use 'auto' to automatically determine if sails is available and running.
     */
    sail?: boolean | 'auto';
    /**
     * Whether to output TS declarations. Use 'only' to emit only declartion and no routes file.
     */
    declarations?: boolean | 'only';
    /**
     * Destination path where ziggy output files should be placed.
     */
    destination?: string;
    log?: boolean;
    delay?: number;
}
export default function ZiggyPlugin(config: ZiggyPluginConfig): Plugin;
