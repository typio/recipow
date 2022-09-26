<script lang="ts">
	import { onMount } from 'svelte'
	import type { Readable } from 'svelte/store'
	import StarterKit from '@tiptap/starter-kit'
	import Heading from '@tiptap/extension-heading'
	import { createImageExtension } from '$lib/TipTapExtensions/image'
	import type { UploadFn } from '$lib/TipTapExtensions/dropImage'
	import Youtube from '@tiptap/extension-youtube'
	import Link from '@tiptap/extension-link'
	import Placeholder from '@tiptap/extension-placeholder'

	import { Editor, EditorContent, FloatingMenu, BubbleMenu, createEditor } from 'svelte-tiptap'

	let editor: Readable<Editor>

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
						console.log(data)
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
			$editor.chain().focus().toggleHeading({ level }).run()
		}
	}

	const setParagraph = () => {
		return () => {
			$editor.chain().focus().setParagraph().run()
		}
	}

	const toggleBold = () => {
		$editor.chain().focus().toggleBold().run()
	}

	const toggleItalic = () => {
		$editor.chain().focus().toggleItalic().run()
	}

	// const setImage = (src: string, alt?: string, title?: string) =>
	// 	$editor.chain().focus().setImage({ src, alt, title }).run()

	const setYoutubeVideo = (src: string, width?: number, height?: number) => $editor.chain().focus().setYoutubeVideo({ src, width, height }).run()

	const toggleLink = () => {
		if ($editor.getAttributes('link').href === undefined) {
			let href = window.prompt('Enter link URL (must be an https website):')
			if (href) {
				$editor
					.chain()
					.focus()
					.toggleLink({
						href,
						target: '_blank'
					})
					.run()
			}
		} else {
			$editor.commands.unsetLink()
		}
	}

	onMount(() => {
		if (mode === 'writeup') {
			editor = createEditor({
				extensions: [
					StarterKit.configure({
						code: false,
						strike: false
					}),
					Youtube,
					Heading.configure({
						levels: [2, 3]
					}),
					Link,
					Placeholder.configure({
						placeholder
					}),
					createImageExtension(uploadImage)
				],
				content
			})
		} else {
			editor = createEditor({
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

		editor.subscribe(a => {
			content = a.getHTML()
		})
	})

	$: isActive = (name: string, attrs = {}) => $editor.isActive(name, attrs)
</script>

{#if editor}
	{#if mode === 'writeup'}
		<FloatingMenu editor={$editor}>
			<div class="floating-menu">
				<button on:click={toggleHeading(2)}>h2</button>
				<button on:click={toggleHeading(3)}>h3</button>
				<button on:click={setParagraph()}>p</button>
				<!-- <button
					on:click={() => {
						let src = window.prompt('Enter image URL:')
						if (src) {
							setImage(src)
						}
					}}>img</button> -->
				<button
					on:click={() => {
						let src = window.prompt('Enter youtube video URL:')
						if (src) {
							setYoutubeVideo(src, 640, 480)
						}
					}}>yt</button>
			</div>
		</FloatingMenu>
	{/if}

	<BubbleMenu editor={$editor}>
		<div class="bubble-menu">
			<button on:click={toggleBold}>bold</button>
			<button on:click={toggleItalic}>italic</button>
			<button on:click={toggleLink}>link</button>
		</div>
	</BubbleMenu>
{/if}

<div class="{mode} editor">
	<EditorContent editor={$editor} />
</div>

<style>
	.editor {
		width: 100%;
	}
</style>
