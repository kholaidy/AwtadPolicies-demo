// js/data.js

const classificationData = {
    "الحوكمة والامتثال": {
        nameEn: "Governance & Compliance",
        manuals: {
            "GOV - دليل الحوكمة وأخلاقيات العمل ": {
                code: "GOV-Manual-1",
                policies: [
                    { code: "GOV-001", name: "مدونة السلوك وأخلاقيات المهنة" },
                    { code: "GOV-002", name: "سياسة مكافحة الفساد والرشوة" },
                    { code: "GOV-003", name: "سياسة الإبلاغ عن المخالفات" },
                    { code: "GOV-004", name: "سياسة تعارض المصالح" }
                ]
            },
            "GOV - دليل التنظيم والصلاحيات ": {
                code: "GOV-Manual-2",
                policies: [
                    { code: "GOV-005", name: "الهيكل التنظيمي المعتمد" },
                    { code: "GOV-006", name: "جدول الصلاحيات (DoA)" }
                ]
            },
            "LGL - دليل الشؤون القانونية ": {
                code: "LGL-Manual",
                policies: [
                    { code: "LGL-001", name: "سياسة مراجعة وإدارة العقود" },
                    { code: "LGL-002", name: "سياسة إدارة التراخيص الحكومية" },
                    { code: "LGL-003", name: "سياسة المساهمة في اعداد نماذج العقود" }
                ]
            },
            "PRM - دليل إدارة الأداء ": {
                code: "PRM-Manual",
                policies: [
                    { code: "PRM-001", name: "سياسة الاجتماع الدوري للإدارة" },
                    { code: "PRM-002", name: "مصفوفة التقارير ومؤشرات الأداء" },
                    { code: "PRM-003", name: "إجراءات متابعة القرارات" }
                ]
            }
        }
    },
    "الادارات الداعمة": {
        nameEn: "Support Departments",
        manuals: {
            "HR - دليل الموارد البشرية": {
                code: "HR-Manual",
                policies: [
                    { code: "HR-001", name: "سياسة التخطيط والتوظيف" },
                    { code: "HR-002", name: "سياسة الرواتب والتعويضات" },
                    { code: "HR-003", name: "سياسة الدوام والإجازات" },
                    { code: "HR-004", name: "سياسة تقييم الأداء والتطوير" },
                    { code: "HR-005", name: "سياسة التدريب والتطوير" },
                    { code: "HR-006", name: "سياسة الإجراءات التأديبية" },
                    { code: "HR-007", name: "سياسة إنهاء الخدمات" },
                    { code: "HR-008", name: "سياسة السلف والعهد" }
                ]
            },
"ملحق HR - لائحة الجزاءات": {
                code: "HR-Manual-Appendix-A",
                policies: [
                    { code: "HR-APX-01", name: "المخالفات الجسيمة (المادة 80)" },
                    { code: "HR-APX-02", name: "جدول المخالفات غير الجسيمة" },
                    { code: "HR-APX-03", name: "آليات التنفيذ والمسؤوليات" }

                ]
            },
            "IT - دليل تقنية المعلومات": {
                code: "IT-Manual",
                policies: [
                    { code: "IT-001", name: "سياسة أمن المعلومات" },
                    { code: "IT-002", name: "سياسة الاستخدام المقبول" },
                    { code: "IT-003", name: "سياسة النسخ الاحتياطي" },
                    { code: "IT-004", name: "سياسة خصوصية البيانات (PDPL)" }
                ]
            },
            "COM - دليل الاتصالات المؤسسية": {
                code: "COM-Manual",
                policies: [
                    { code: "COM-001", name: "سياسة التواصل الداخلي" },
                    { code: "COM-002", name: "سياسة العلاقات الإعلامية والمتحدث الرسمي" },
                    { code: "COM-003", name: "سياسة استخدام وسائل التواصل الاجتماعي" },
                    { code: "COM-004", name: "دليل الهوية البصرية والعلامة التجارية" }
                ]
            },
            "FIN - دليل المالية": {
                code: "FIN-Manual",
                policies: [
                    { code: "FIN-001", name: "سياسة التخطيط المالي والميزانيات" },
                    { code: "FIN-002", name: "سياسة الفوترة والتحصيل" },
                    { code: "FIN-003", name: "سياسة المصروفات النثرية والعُهد" },
                    { code: "FIN-004", name: "سياسة إدارة التحصيلات والديون" }
                ]
            },
            "ACC - دليل المحاسبة": {
                code: "ACC-Manual",
                policies: [
                    { code: "ACC-001", name: "سياسة الاعتراف بالإيراد" },
                    { code: "ACC-002", name: "سياسة الاعتراف بالمصروفات" },
                    { code: "ACC-003", name: "سياسة الأصول الثابتة" },
                    { code: "ACC-004", name: "سياسة المخزون" },
                    { code: "ACC-005", name: "سياسة المخصصات" },
                    { code: "ACC-006", name: "سياسة التسويات" },
                    { code: "ACC-007", name: "سياسة الإقفال المحاسبي" },
                    { code: "ACC-008", name: "سياسة الامتثال للزكاة والضريبة" }
                ]
            },
            "AM - دليل إدارة الأصول": {
                code: "AM-Manual",
                policies: [
                    { code: "AM-001", name: "سياسة صيانة المعدات" },
                    { code: "AM-002", name: "سياسة تتبع وتسجيل الأصول" },
                    { code: "AM-003", name: "سياسة إدارة سيارات الشركة" }
                ]
            },
            "DCC - دليل التحكم بالوثائق": {
                code: "DCC-Manual",
                policies: [
                    { code: "DCC-001", name: "سياسة ترميز وتصنيف الوثائق" },
                    { code: "DCC-002", name: "إجراءات إدارة المراسلات" },
                    { code: "DCC-003", name: "سياسة الأرشفة والاحتفاظ" }
                ]
            }
        }
    },
    "المشتريات وإدارة المواد": {
        nameEn: "Procurement & Materials Management",
        manuals: {
            "PROC - دليل المشتريات": {
                code: "PROC-Manual",
                policies: [
                    { code: "PROC-001", name: "سياسة المشتريات (PR to PO)" },
                    { code: "PROC-002", name: "سياسة تأهيل وتقييم الموردين" },
                    { code: "PROC-003", name: "سياسة إدارة مقاولي الباطن" }
                ]
            },
            "STO - دليل إدارة المخازن": {
                code: "STO-Manual",
                policies: [
                    { code: "STO-001", name: "سياسة استلام وتخزين المواد" },
                    { code: "STO-002", name: "سياسة صرف المواد للمشاريع" },
                    { code: "STO-003", name: "سياسة الجرد ومراقبة المخزون" },
                    { code: "STO-004", name: "سياسة إدارة المواد الراكدة" }
                ]
            }
        }
    },
    "تطوير الأعمال والعطاءات": {
        nameEn: "Business Development & Tendering",
        manuals: {
            "BDM - دليل تطوير الأعمال": {
                code: "BDM-Manual",
                policies: [
                    { code: "BDM-001", name: "سياسة إدارة دورة حياة الفرص" },
                    { code: "BDM-002", name: "سياسة إدارة علاقات العملاء" },
                    { code: "BDM-003", name: "إجراءات تسليم ومتابعة العروض" },
                    { code: "BDM-004", name: "سياسة مراقبة السمعة الرقمية" }
                ]
            },
            "TEN - دليل العطاءات والتسعير ": {
                code: "TEN-Manual",
                policies: [
                    { code: "TEN-001", name: "سياسة دراسة العطاءات والتسعير" },
                    { code: "TEN-002", name: "سياسة اعتماد وتقديم العروض" }
                ]
            }
        }
    },
    "إدارة المشاريع والعمليات": {
        nameEn: "Project Management & Operations",
        manuals: {
            "PMO - دليل مكتب إدارة المشاريع ": {
                code: "PMO-Manual",
                policies: [
                    { code: "PMO-001", name: "سياسة بدء وتخطيط المشروع" },
                    { code: "PMO-002", name: "سياسة إدارة أوامر التغيير" },
                    { code: "PMO-003", name: "سياسة تسليم وإغلاق المشاريع" },
                    { code: "PMO-004", name: "المشاركة في اعداد خطة التدفقات النقدية" }
                ]
            },
            "PEM - دليل تنفيذ المشاريع": {
                code: "PEM-Manual",
                policies: [
                    { code: "PEM-000", name: "صلاحيات ومسؤوليات إدارة المشاريع التنفيذية" },
                    { code: "PEM-001", name: "إدارة العمليات اليومية بالموقع" },
                    { code: "PEM-002", name: "إدارة موارد الموقع" },
                    { code: "PEM-003", name: "المراسلات الفنية مع الاستشاري والمالك" },
                    { code: "PEM-004", name: "إدارة المستخلصات والفوترة" },
                    { code: "PEM-005", name: "إدارة المخاطر والطوارئ" },
                    { code: "PEM-006", name: "أعمال صب الخرسانة" },
                    { code: "PEM-007", name: "إدارة التشوينات والمساحات المؤقتة بالموقع" },
                    { code: "PEM-008", name: "ادارة استهلاك الموارد" }
                ]
            },
            "CC - دليل ضبط التكاليف": {
                code: "CC-Manual",
                policies: [
                    { code: "CC-001", name: "سياسة ضبط ومراقبة التكاليف" }
                ]
            }
        }
    },
    "السلامة وضبط الجودة": {
        nameEn: "HSE & Quality Assurance",
        manuals: {
            "HSE - دليل الصحة والسلامة": {
                code: "HSE-Manual",
                policies: [
                    { code: "HSE-001", name: "إجراءات السلامة العامة بالموقع" },
                    { code: "HSE-002", name: "خطط الاستجابة للطوارئ" },
                    { code: "HSE-003", name: "سياسة حماية البيئة وإدارة المخلفات" }
                ]
            },
            "QAQC - دليل ضبط الجودة": {
                code: "QAQC-Manual",
                policies: [
                    { code: "QAQC-001", name: "خطة الجودة للمشروع (QAP)" },
                    { code: "QAQC-002", name: "إجراءات الفحص والاستلام" },
                    { code: "QAQC-003", name: "سياسة إدارة عدم المطابقة (NCRs)" }
                ]
            }
        }
    }
};