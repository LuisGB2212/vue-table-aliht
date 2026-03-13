import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        vue(),
        dts({ 
          insertTypesEntry: true,
          rollupTypes: true
        })
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'VueDataTableCorporative',
          fileName: 'vue-data-table-corporative',
        },
        rollupOptions: {
          external: ['vue', 'pinia'],
          output: {
            exports: 'named',
            globals: {
              vue: 'Vue',
              pinia: 'Pinia',
            },
          },
        },
      },
    }
  }

  return {
    plugins: [vue()],
  }
})