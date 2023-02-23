import vercel from '@sveltejs/adapter-vercel'
import preprocess from 'svelte-preprocess'

const config = {
    preprocess: preprocess({
        postcss: true
    }),
    kit: {
        adapter: vercel({
            runtime: 'edge'
        })
    }
}
export default config
