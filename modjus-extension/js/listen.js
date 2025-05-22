window.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_EDITORS') {
    const payload = event.data.payload;
    console.log('CKEDITOR listener:', payload);
    if (window.CKEDITOR && CKEDITOR.instances[payload.id]) {
      CKEDITOR.instances[payload.id].setData(payload.html);
    }
  }
});