if (!CKEDITOR.plugins.get('ae_pasteimages')) {
	/**
	 * CKEditor plugin which allows pasting images directly into the editable area. The image will be encoded
	 * as Data URI. An event `beforeImageAdd` will be fired with the list of pasted images. If any of the listeners
	 * returns `false` or cancels the event, the images won't be added to the content. Otherwise,
	 * an event `imageAdd` will be fired with the inserted element into the editable area.
	 *
	 * @class CKEDITOR.plugins.ae_pasteimages
	 */

	/**
	 * Fired before adding images to the editor.
	 * @event beforeImageAdd
	 * @param {Array} imageFiles Array of image files
	 */

	/**
	 * Fired when an image is being added to the editor successfully.
	 *
	 * @event imageAdd
	 * @param {CKEDITOR.dom.element} el The created image with src as Data URI
	 * @param {File} file The image file
	 */

	CKEDITOR.plugins.add('ae_pasteimages', {
		/**
		 * Initialization of the plugin, part of CKEditor plugin lifecycle.
		 * The function registers a 'paste' event on the editing area.
		 *
		 * @method init
		 * @param {Object} editor The current editor instance
		 */
		init(editor) {
			editor.once(
				'contentDom',
				function() {
					const editable = editor.editable();

					editable.attachListener(
						editable,
						'paste',
						this._onPaste,
						this,
						{
							editor,
						}
					);
				}.bind(this)
			);
		},

		/**
		 * The function creates an img element with src the image data as Data URI.
		 * Then, it fires an 'imageAdd' event via CKEditor's event system. The passed
		 * params will be:
		 * - `el` - the created img element
		 * - `file` - the original pasted data
		 *
		 * @method _onPaste
		 * @protected
		 * @param {CKEDITOR.dom.event} event A `paste` event, as received natively from CKEditor
		 */
		_onPaste(event) {
			if (event.data.$.clipboardData) {
				const pastedData = event.data.$.clipboardData.items[0];
				const editor = event.listenerData.editor;

				if (pastedData.type.indexOf('image') === 0) {
					const reader = new FileReader();
					const imageFile = pastedData.getAsFile();

					reader.onload = function(event) {
						const result = editor.fire('beforeImageAdd', {
							imageFiles: imageFile,
						});

						if (result) {
							const el = CKEDITOR.dom.element.createFromHtml(
								'<img src="' + event.target.result + '">'
							);

							editor.insertElement(el);

							const imageData = {
								el,
								file: imageFile,
							};

							editor.fire('imageAdd', imageData);
						}
					};

					reader.readAsDataURL(imageFile);
				}
			}
		},
	});
}
