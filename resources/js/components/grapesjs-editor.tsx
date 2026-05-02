import { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';

interface Props {
    initialHtml?: string;
    initialData?: Record<string, unknown> | null;
    onSave: (html: string, projectData: Record<string, unknown>) => void;
}

const customBlocks = [
    {
        id: 'hero',
        label: 'Hero',
        category: 'Landing',
        media: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M2 4h20v6H2zM2 12h20v8H2z"/></svg>',
        content: `
            <section style="padding:80px 24px;background:linear-gradient(135deg,#0d6efd 0%,#6610f2 100%);color:white;text-align:center;">
                <h1 style="font-size:48px;font-weight:700;margin:0 0 16px 0;">Your Big Headline Here</h1>
                <p style="font-size:20px;margin:0 0 32px 0;opacity:0.9;">A short, compelling subheadline that hooks visitors instantly.</p>
                <a href="#" style="display:inline-block;padding:14px 32px;background:white;color:#0d6efd;border-radius:8px;font-weight:600;text-decoration:none;">Buy Now</a>
            </section>
        `,
    },
    {
        id: 'product-card',
        label: 'Product Card',
        category: 'Landing',
        media: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M3 3h18v18H3zM3 8h18M8 3v18"/></svg>',
        content: `
            <div style="max-width:340px;margin:24px auto;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;background:white;">
                <img src="https://via.placeholder.com/340x240" style="width:100%;display:block;" />
                <div style="padding:20px;">
                    <h3 style="margin:0 0 8px 0;font-size:20px;">Product Name</h3>
                    <p style="color:#666;margin:0 0 16px 0;font-size:14px;">A short description of the product.</p>
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <span style="font-size:24px;font-weight:700;color:#0d6efd;">RM 99</span>
                        <button style="padding:10px 20px;background:#0d6efd;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Add to Cart</button>
                    </div>
                </div>
            </div>
        `,
    },
    {
        id: 'cta-banner',
        label: 'CTA Banner',
        category: 'Landing',
        media: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M2 6h20v12H2zM7 9h10v2H7zM7 13h6v2H7z"/></svg>',
        content: `
            <section style="padding:60px 24px;background:#fff8e7;text-align:center;">
                <h2 style="font-size:32px;margin:0 0 12px 0;color:#1a1a1a;">Limited Time Offer</h2>
                <p style="font-size:18px;color:#666;margin:0 0 24px 0;">Grab this deal before it's gone.</p>
                <a href="#" style="display:inline-block;padding:14px 36px;background:#ffc107;color:#1a1a1a;border-radius:8px;font-weight:700;text-decoration:none;">Claim Discount</a>
            </section>
        `,
    },
    {
        id: 'features-grid',
        label: 'Features (3 cols)',
        category: 'Landing',
        media: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M3 3h6v6H3zM10 3h6v6h-6zM17 3h4v6h-4zM3 10h18v4H3zM3 15h18v6H3z"/></svg>',
        content: `
            <section style="padding:60px 24px;background:white;">
                <h2 style="text-align:center;font-size:32px;margin:0 0 40px 0;">Why Choose Us</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto;">
                    <div style="text-align:center;padding:24px;">
                        <div style="font-size:48px;margin-bottom:12px;">🚀</div>
                        <h3 style="margin:0 0 8px 0;font-size:20px;">Fast Delivery</h3>
                        <p style="color:#666;margin:0;">Shipped within 24 hours.</p>
                    </div>
                    <div style="text-align:center;padding:24px;">
                        <div style="font-size:48px;margin-bottom:12px;">💎</div>
                        <h3 style="margin:0 0 8px 0;font-size:20px;">Premium Quality</h3>
                        <p style="color:#666;margin:0;">Carefully crafted, hand-checked.</p>
                    </div>
                    <div style="text-align:center;padding:24px;">
                        <div style="font-size:48px;margin-bottom:12px;">🛡️</div>
                        <h3 style="margin:0 0 8px 0;font-size:20px;">Money-back Guarantee</h3>
                        <p style="color:#666;margin:0;">30 days no questions asked.</p>
                    </div>
                </div>
            </section>
        `,
    },
    {
        id: 'testimonial',
        label: 'Testimonial',
        category: 'Landing',
        media: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M5 7h6v6H5zM7 8h2v4H7zM13 7h6v6h-6zM15 8h2v4h-2z"/></svg>',
        content: `
            <section style="padding:60px 24px;background:#f8f9fa;text-align:center;">
                <div style="max-width:700px;margin:0 auto;">
                    <p style="font-size:24px;font-style:italic;color:#333;line-height:1.5;margin:0 0 24px 0;">"This product genuinely changed my morning routine. Worth every ringgit."</p>
                    <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
                        <img src="https://i.pravatar.cc/56" style="width:56px;height:56px;border-radius:50%;" />
                        <div style="text-align:left;">
                            <div style="font-weight:700;">Aisha Binti Ali</div>
                            <small style="color:#666;">Verified Customer</small>
                        </div>
                    </div>
                </div>
            </section>
        `,
    },
    {
        id: 'lead-form',
        label: 'Lead Form',
        category: 'Landing',
        media: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M3 3h18v18H3zM5 7h14v2H5zM5 11h14v2H5zM5 15h8v2H5z"/></svg>',
        content: `
            <section style="padding:60px 24px;background:white;">
                <div style="max-width:480px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:12px;">
                    <h2 style="margin:0 0 8px 0;font-size:24px;text-align:center;">Get In Touch</h2>
                    <p style="text-align:center;color:#666;margin:0 0 24px 0;">We'll respond within 1 business day.</p>
                    <input type="text" placeholder="Your Name" style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;" />
                    <input type="email" placeholder="Email" style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;" />
                    <textarea placeholder="Message" rows="4" style="width:100%;padding:12px;margin-bottom:16px;border:1px solid #ddd;border-radius:6px;"></textarea>
                    <button style="width:100%;padding:14px;background:#0d6efd;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Send Message</button>
                </div>
            </section>
        `,
    },
];

export default function GrapesJSEditor({ initialHtml, initialData, onSave }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Editor | null>(null);
    const onSaveRef = useRef(onSave);
    onSaveRef.current = onSave;

    useEffect(() => {
        if (!containerRef.current) return;

        const editor = grapesjs.init({
            container: containerRef.current,
            height: '700px',
            width: 'auto',
            storageManager: false,
            plugins: [gjsBlocksBasic, gjsPresetWebpage],
            pluginsOpts: {
                'grapesjs-blocks-basic': { flexGrid: true },
            },
            canvas: {
                styles: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'],
            },
            deviceManager: {
                devices: [
                    { id: 'desktop', name: 'Desktop', width: '' },
                    { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
                    { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '575px' },
                ],
            },
        });

        customBlocks.forEach(b => {
            editor.BlockManager.add(b.id, b);
        });

        if (initialData) {
            try {
                editor.loadProjectData(initialData);
            } catch {
                if (initialHtml) editor.setComponents(initialHtml);
            }
        } else if (initialHtml) {
            editor.setComponents(initialHtml);
        }

        const handleUpdate = () => {
            const html = editor.getHtml();
            const css = editor.getCss();
            const fullHtml = `<style>${css}</style>${html}`;
            const projectData = editor.getProjectData();
            onSaveRef.current(fullHtml, projectData);
        };

        editor.on('component:update', handleUpdate);
        editor.on('component:remove', handleUpdate);
        editor.on('component:add', handleUpdate);

        editorRef.current = editor;

        return () => {
            editor.destroy();
            editorRef.current = null;
        };
    }, []);

    return <div ref={containerRef} />;
}
