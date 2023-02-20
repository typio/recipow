<script lang="ts">
	import { onMount, onDestroy } from 'svelte'

	import { Editor } from '@tiptap/core'

	import { createImageExtension } from '$lib/TipTapExtensions/image'
	import StarterKit from '@tiptap/starter-kit'
	import Heading from '@tiptap/extension-heading'
	import Youtube from '@tiptap/extension-youtube'
	import Link from '@tiptap/extension-link'
	import Placeholder from '@tiptap/extension-placeholder'
    import BubbleMenu from '@tiptap/extension-bubble-menu'
    import FloatingMenu from '@tiptap/extension-floating-menu'

	import type { UploadFn } from '$lib/TipTapExtensions/dropImage'

    import YouTubePlayButtonSVG from '$lib/assets/yt_play_btn_mono.svg'


    let element: Element
	let editor: Editor

	export let content = ''
	export let mode = 'generic'
	export let placeholder = ''

	const uploadImage: UploadFn = async (file): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = async () => {
				await fetch('/api/uploadImage', {
					method: 'POST',
					body: JSON.stringify({
						bucketName: 'recipe_imgs',
						imageBase64: reader.result as string,
						isTemp: true
					})
				})
                .then(res => res.json())
                .then(data => {
                    if (data?.message == "Internal Error") {
                        alert("Failed to upload image. Currently only PNGs are accepted.")
                    } else {
                        console.log(data)
                    }
                    resolve(data.imageUrl)
                })
                .catch(err => {
                    resolve(err)
                    reject(err)
                })
			}
		})
	}

	const toggleHeading = (level: any) => {
		return () => {
			editor.chain().focus().toggleHeading({ level }).run()
		}
	}

	const setParagraph = () => {
		return () => {
			editor.chain().focus().setParagraph().run()
		}
	}

	const toggleBold = () => {
		editor.chain().focus().toggleBold().run()
	}

	const toggleItalic = () => {
		editor.chain().focus().toggleItalic().run()
	}

	// const setImage = (src: string, alt?: string, title?: string) =>
	// 	$editor.chain().focus().setImage({ src, alt, title }).run()

	const setYoutubeVideo = (src: string, width?: number, height?: number) => editor.chain().focus().setYoutubeVideo({ src, width, height }).run()

	const toggleLink = () => {
		if (editor.getAttributes('link').href === undefined) {
			let href = window.prompt('Enter link URL (must be an https website):')
			if (href) {
				editor
					.chain()
					.focus()
					.toggleLink({
						href,
						target: '_blank'
					})
					.run()
			}
		} else {
			editor.commands.unsetLink()
		}
	}

	onMount(() => {
        let bubbleMenuElement: HTMLElement= document.getElementById('bubble-menu')!
        bubbleMenuElement.style.display = 'inline'

        let floatingMenuElement: HTMLElement= document.getElementById('floating-menu')!
        floatingMenuElement.style.display = 'inline'

		if (mode === 'writeup') {
			editor = new Editor({
                element,
				extensions: [
					StarterKit.configure({
						code: false,
						strike: false
					}),
					Youtube,
					Heading.configure({ levels: [2, 3] }),
					Link,
					Placeholder.configure({ placeholder }),
					createImageExtension(uploadImage),
                    BubbleMenu.configure({
                        element: bubbleMenuElement,
                    }),
                    FloatingMenu.configure({
                    element: floatingMenuElement
                    })
				],
				content,
                onTransaction: () => { editor = editor }
			})
		} else {
			editor = new Editor({
				extensions: [
					StarterKit.configure({
						code: false,
						strike: false
					}),
					Placeholder.configure({
						placeholder
					}),
					Link
				],
				content
			})
		}

		// editor.subscribe(a => {
		//  content = a.getHTML()
		// })
	})

    onDestroy(() => {
        if (editor) editor.destroy()
    })
</script>
    

<div id="floating-menu" class="hidden">
    <button 
        class="text-stone-500 text-lg mr-2"
        on:click={toggleHeading(2)}>
        H2
    </button>
    <button 
        class="text-stone-500 text-md mr-2"
        on:click={toggleHeading(3)}>
        H3
    </button>
    <button 
        class="text-stone-500 mr-2"
        on:click={setParagraph()}>
        p
    </button>
    <!-- <button
        class="text-stone-500"
        on:click={() => {
            let src = window.prompt('Enter image URL:')
            if (src) {
                //setImage(src)
            }
        }}>img</button> -->
    <button
        class="text-stone-500"
        on:click={() => {
            let src = window.prompt('Enter a YouTube video URL:')
            if (src) {
                setYoutubeVideo(src, 640, 480)
            }
        }}>
        <img
            class="dark:brightness-[500] w-6 fixed top-[6px]"
            src={YouTubePlayButtonSVG} alt="YouTube logo" 
        />
    </button>
</div>

<div id="bubble-menu" class="hidden">
    <button
        class="ring-2 ring-stone-700 dark:ring-stone-300 rounded px-2 mr-2"
        on:click={toggleBold}>
        bold
    </button>
    <button
        class="ring-2 ring-stone-700 dark:ring-stone-300 rounded px-2 mr-2"
        on:click={toggleItalic}>
        italic
    </button>
    <button
        class="ring-2 ring-stone-700 dark:ring-stone-300 rounded px-2"
        on:click={toggleLink}>
        link
    </button>
</div>

<div class="{mode} editor" bind:this={element} />

<style>
	.editor {
		width: 100%;
	}
</style>
