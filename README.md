# Awtad AI Policy Assistant Widget

This is a single-file, dependency-free JavaScript widget to assist with policy documents.

## Integration

To add the widget to your website, add the following script tag to your HTML file, preferably before the closing `</body>` tag. You can customize the widget's behavior using the `data-*` attributes.

```html
<script defer 
  src="/assets/awtad-ai-widget.min.js" 
  data-endpoint="https://awtad-policies-ai.kholaidy.workers.dev/api/policies-ai" 
  data-title="مساعد السياسات الذكي" 
  data-welcome="ألصق نص السياسة هنا… أو اتركني أقرأ الصفحة."
  data-lang="ar"></script>
```

### `data` Attributes:

- `src`: Path to the minified widget script. **(Required)**
- `data-endpoint`: The API endpoint for the AI service. Defaults to the Awtad Policies AI worker.
- `data-title`: The title displayed in the modal header.
- `data-welcome`: The placeholder text in the textarea.
- `data-lang`: Language setting (currently 'ar' by default). Reserved for future use.