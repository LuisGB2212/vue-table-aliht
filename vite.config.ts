import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [vue()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'VueTransactionsTable',
          fileName: 'vue-transactions-table',
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
