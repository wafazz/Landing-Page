import { Editor } from '@tinymce/tinymce-react';

interface Props {
    value: string;
    onChange: (val: string) => void;
    height?: number;
}

export default function TinyMCEEditor({ value, onChange, height = 500 }: Props) {
    return (
        <Editor
            licenseKey="gpl"
            tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
            value={value}
            onEditorChange={onChange}
            init={{
                height,
                menubar: 'file edit view insert format tools table',
                plugins:
                    'advlist autolink lists link image charmap preview anchor ' +
                    'searchreplace visualblocks code fullscreen insertdatetime media ' +
                    'table wordcount emoticons',
                toolbar:
                    'undo redo | blocks fontsize | bold italic underline strikethrough | ' +
                    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                    'forecolor backcolor | link image media table emoticons | code preview fullscreen',
                content_style:
                    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; }',
                branding: false,
                promotion: false,
            }}
        />
    );
}
