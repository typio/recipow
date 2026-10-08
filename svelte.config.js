import adapter from 'svelte-adapter-bun'
import preprocess from 'svelte-preprocess'

const config = {
    preprocess: preprocess({
        postcss: true
    }),
    kit: {
        adapter: adapter({
            out: 'build',
            precompress: { gzip: true }
        })
    }
}
export default config
