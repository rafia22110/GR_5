
export const translations = {
  en: {
    auth: {
      title: 'Welcome to GitRocket',
      subtitle: 'The AI-Powered DevOps Workbench',
      emailLabel: 'Email Address',
      emailPlace: 'developer@example.com',
      passLabel: 'Password',
      passPlace: '••••••••',
      loginBtn: 'Sign In',
      googleBtn: 'Continue with Google',
      noAccount: "Don't have an account?",
      register: 'Sign up',
      loggingIn: 'Authenticating...',
    },
    sub: {
      title: 'Choose Your Engine',
      subtitle: 'Unlock the full power of local AI deployment.',
      free: {
        title: 'Scout',
        price: '$0',
        period: '/mo',
        btn: 'Continue Free',
        features: ['3 Uploads Total', '1 Upload per Week', 'Web Deployer', 'Community Support']
      },
      pro: {
        title: 'Commander',
        price: '$19',
        period: '/mo',
        btn: 'Start Pro Trial',
        features: ['50 Uploads / Month', 'GitRocket Desktop App', 'Local Git Integration', 'Priority Support']
      }
    },
    install: {
      btn: 'Export Source Code',
      version: 'HTML/JS/CSS (Portable)',
      downloading: 'Packaging source...',
    },
    sidebar: {
      devops: 'GitRocket',
      logout: 'Sign Out',
      runningOn: 'Powered by Gemini'
    },
    devops: {
      title: 'GitRocket Command Center',
      subtitle: 'Deploy local projects to the cloud instantly.',
      modes: {
        web: 'Web Deployer (Browser)',
        cli: 'Local Agent (CLI Script)',
      },
      web: {
        tokenLabel: 'GitHub Token (Required)',
        tokenPlace: 'ghp_...',
        tokenEnv: 'Loaded from Environment',
        securityNote: 'Token is used only in-memory and not stored.',
        repoLabel: 'Repository Name',
        repoPlace: 'my-new-app',
        domainLabel: 'Domain Settings',
        domainDefault: 'Default (GitHub Pages)',
        domainCustom: 'Custom Domain',
        domainPlace: 'www.example.com',
        folderLabel: 'Select Project Folder',
        folderBtn: 'Browse Folder',
        folderSelected: 'files ready',
        deployBtn: 'Launch Rocket 🚀',
        deploying: 'Deploying to GitHub...',
        success: 'Mission Accomplished!',
        viewRepo: 'View Repository',
        viewActions: 'View CI/CD Pipeline',
        createDomain: 'Check Live URL',
        provisioning: 'Verifying DNS...',
        openApp: 'Open Live App',
        limitReached: 'Upload Limit Reached!',
        upgradeMsg: 'You have reached your plan limits. Upgrade to Pro for more.',
        tabs: {
            terminal: 'Mission Logs',
            preview: 'Live Preview'
        },
        previewHint: 'Select a folder with index.html to see a preview.',
      },
      logs: {
        start: 'Initializing Launch Sequence...',
        analyzing: 'Analyzing file structure...',
        detected: 'Detected Language:',
        docker: 'Generating Dockerfile (Auto-Detect)...',
        cname: 'Configuring Custom Domain (CNAME)...',
        generating: 'Generating GitHub Pages Workflows...',
        creatingRepo: 'Creating GitHub Repository...',
        uploading: 'Uploading project files...',
        done: 'Process Complete. Your app is live!',
        error: 'Error:',
      },
      configTitle: 'Agent Configuration',
      configSubtitle: 'Configure your deployment parameters.',
      fields: {
        repoName: 'Repository Name',
        repoPlaceholder: 'my-awesome-project',
        localPath: 'Local Folder Path',
        localPlaceholder: 'C:/Projects/MyApp or ./my-app',
        token: 'GitHub Token (optional if in env)',
        tokenPlaceholder: 'ghp_xxxxxxxxxxxx',
        isPrivate: 'Private Repository',
      },
      actions: {
        downloadScript: 'Download Agent (.py)',
        downloadReqs: 'Download Requirements',
        copyCommand: 'Copy Command',
        copied: 'Copied!',
        getToken: 'Get Token',
      },
    },
    roadmap: {
      title: 'Project Roadmap',
      subtitle: 'Our journey to building the ultimate developer tool.',
      legend: {
        completed: 'Completed',
        planned: 'Planned',
      },
      phases: [
        {
          id: '01',
          status: 'completed',
          title: 'Foundation',
          items: ['Core UI/UX Design', 'Authentication System', 'Gemini Integration']
        },
        {
          id: '02',
          status: 'completed',
          title: 'DevOps Agent',
          items: ['Web Deployer', 'GitHub Integration', 'File Analysis']
        },
        {
          id: '03',
          status: 'planned',
          title: 'Advanced Features',
          items: ['Team Collaboration', 'Custom Models', 'Analytics Dashboard']
        }
      ]
    },
    chat: {
      modelFlash: 'Gemini 2.5 Flash',
      modelPro: 'Gemini 3 Pro (Preview)',
      thinking: 'Thinking Budget',
      off: 'Off',
      groundingOn: 'Grounding On',
      groundingOff: 'Grounding Off',
      startMessage: 'Start a conversation with Gemini...',
      thinkingProcess: 'Thinking...',
      sources: 'Sources',
      placeholder: 'Type your message...',
      disclaimer: 'Gemini may display inaccurate info, including about people, so double-check its responses.'
    },
    live: {
      title: 'Gemini Live',
      ready: 'Ready to connect',
      connecting: 'Connecting...',
      listening: 'Listening...',
      start: 'Start Live Session',
      end: 'End Session',
      error: 'Connection error. Please try again.'
    },
    image: {
      title: 'Image Studio',
      subtitle: 'Generate high-quality images with Gemini.',
      placeholder: 'Describe the image you want to generate...',
      aspectRatio: {
        square: 'Square (1:1)',
        landscape169: 'Landscape (16:9)',
        portrait916: 'Portrait (9:16)',
        portrait34: 'Portrait (3:4)',
        landscape43: 'Landscape (4:3)'
      },
      generate: 'Generate',
      creating: 'Creating...',
      download: 'Download'
    },
    video: {
      title: 'Video Studio',
      subtitle: 'Create videos from text prompts with Veo.',
      promptLabel: 'Video Prompt',
      promptPlaceholder: 'Describe the video you want to create...',
      aspectLabel: 'Aspect Ratio',
      resLabel: 'Resolution',
      generate: 'Generate Video',
      generating: 'Generating...',
      status: {
        init: 'Initializing...',
        waitingKey: 'Waiting for API Key selection...',
        submitting: 'Submitting request...',
        dreaming: 'Dreaming up pixels...',
        done: 'Video ready!'
      },
      generatedBy: 'Generated by Veo',
      download: 'Download MP4'
    }
  },
  he: {
    auth: {
      title: 'ברוכים הבאים ל-GitRocket',
      subtitle: 'סביבת העבודה האולטימטיבית למפתחים',
      emailLabel: 'כתובת דוא״ל',
      emailPlace: 'developer@example.com',
      passLabel: 'סיסמה',
      passPlace: '••••••••',
      loginBtn: 'התחבר',
      googleBtn: 'המשך עם Google',
      noAccount: "אין לך חשבון?",
      register: 'הירשם',
      loggingIn: 'מאמת נתונים...',
    },
    sub: {
      title: 'בחר את המנוע שלך',
      subtitle: 'פתח את מלוא העוצמה של פריסה מקומית.',
      free: {
        title: 'סייר',
        price: '₪0',
        period: '/חודש',
        btn: 'המשך בחינם',
        features: ['3 העלאות סה״כ', '1 העלאה בשבוע', 'פורס רשת', 'תמיכה קהילתית']
      },
      pro: {
        title: 'מפקד',
        price: '₪69',
        period: '/חודש',
        btn: 'התחל ניסיון Pro',
        features: ['50 העלאות בחודש', 'אפליקציית GitRocket לשולחן העבודה', 'אינטגרציית Git מקומית', 'תמיכה מועדפת']
      }
    },
    install: {
      btn: 'ייצא קוד מקור',
      version: 'HTML/JS/CSS (נייד)',
      downloading: 'אורז קוד מקור...',
    },
    sidebar: {
      devops: 'GitRocket',
      runningOn: 'מופעל ע״י Gemini',
      logout: 'התנתק',
    },
    devops: {
      title: 'מרכז הבקרה GitRocket',
      subtitle: 'הפוך תיקייה מקומית לפרויקט ענן פעיל.',
      modes: {
        web: 'פורס רשת (דפדפן)',
        cli: 'סוכן מקומי (CLI)',
      },
      web: {
        tokenLabel: 'טוקן GitHub (חובה)',
        tokenPlace: 'ghp_...',
        tokenEnv: 'נטען מהסביבה',
        securityNote: 'הטוקן נשמר בזיכרון הדפדפן בלבד.',
        repoLabel: 'שם ה-Repository',
        repoPlace: 'my-new-app',
        domainLabel: 'הגדרות דומיין',
        domainDefault: 'ברירת מחדל (GitHub Pages)',
        domainCustom: 'דומיין מותאם אישית',
        domainPlace: 'www.example.com',
        folderLabel: 'בחר תיקייה לפריסה',
        folderBtn: 'בחר תיקייה',
        folderSelected: 'קבצים זוהו',
        deployBtn: 'שגר טיל 🚀',
        deploying: 'מעלה ל-GitHub...',
        success: 'המשימה הושלמה!',
        viewRepo: 'צפה ב-Repository',
        viewActions: 'צפה ב-CI/CD',
        createDomain: 'בדוק כתובת אתר',
        provisioning: 'מאמת DNS...',
        openApp: 'פתח אפליקציה',
        limitReached: 'הגעת למגבלת ההעלאות!',
        upgradeMsg: 'הגעת למקסימום בחבילה שלך. שדרג ל-Pro כדי להמשיך.',
        tabs: {
            terminal: 'לוג משימה (Terminal)',
            preview: 'תצוגה מקדימה (Preview)'
        },
        previewHint: 'בחר תיקייה עם index.html כדי לראות תצוגה מקדימה.',
      },
      logs: {
        start: 'מתחיל תהליך שיגור...',
        analyzing: 'מנתח מבנה קבצים...',
        detected: 'זוהתה שפה:',
        docker: 'מייצר אוטומטית Dockerfile...',
        cname: 'מגדיר דומיין מותאם אישית (CNAME)...',
        generating: 'מייצר תשתיות GitHub Pages...',
        creatingRepo: 'יוצר Repository ב-GitHub...',
        uploading: 'מעלה קבצי פרויקט...',
        done: 'התהליך הסתיים. האפליקציה באוויר!',
        error: 'שגיאה:',
      },
      configTitle: 'הגדרת הסוכן',
      configSubtitle: 'הגדר את פרמטרי הפריסה כדי ליצור את פקודת ההרצה.',
      fields: {
        repoName: 'שם ה-Repository',
        repoPlaceholder: 'my-awesome-project',
        localPath: 'נתיב תיקייה מקומי',
        localPlaceholder: 'C:/Projects/MyApp או ./my-app',
        token: 'טוקן GitHub (אופציונלי אם מוגדר ב-env)',
        tokenPlaceholder: 'ghp_xxxxxxxxxxxx',
        isPrivate: 'Repository פרטי',
      },
      actions: {
        downloadScript: 'הורד סוכן (.py)',
        downloadReqs: 'הורד תלויות',
        copyCommand: 'העתק פקודה',
        copied: 'הועתק!',
        getToken: 'קבל טוקן',
      },
    },
    roadmap: {
      title: 'מפת דרכים',
      subtitle: 'המסע שלנו לבניית הכלי האולטימטיבי למפתחים.',
      legend: {
        completed: 'הושלם',
        planned: 'מתוכנן',
      },
      phases: [
        {
          id: '01',
          status: 'completed',
          title: 'יסודות',
          items: ['עיצוב UI/UX', 'מערכת אימות', 'אינטגרציית Gemini']
        },
        {
          id: '02',
          status: 'completed',
          title: 'סוכן DevOps',
          items: ['פורס רשת', 'אינטגרציית GitHub', 'ניתוח קבצים']
        },
        {
          id: '03',
          status: 'planned',
          title: 'תכונות מתקדמות',
          items: ['שיתוף פעולה בצוות', 'מודלים מותאמים', 'לוח מחוונים אנליטי']
        }
      ]
    },
    chat: {
      modelFlash: 'Gemini 2.5 Flash',
      modelPro: 'Gemini 3 Pro (Preview)',
      thinking: 'תקציב חשיבה',
      off: 'כבוי',
      groundingOn: 'Grounding פעיל',
      groundingOff: 'Grounding כבוי',
      startMessage: 'התחל שיחה עם Gemini...',
      thinkingProcess: 'חושב...',
      sources: 'מקורות',
      placeholder: 'הקלד את ההודעה שלך...',
      disclaimer: 'Gemini עלול להציג מידע לא מדויק, כולל לגבי אנשים, אז בדוק שוב את התשובות שלו.'
    },
    live: {
      title: 'Gemini Live',
      ready: 'מוכן לחיבור',
      connecting: 'מתחבר...',
      listening: 'מקשיב...',
      start: 'התחל שיחה חיה',
      end: 'סיים שיחה',
      error: 'שגיאת חיבור. נסה שוב.'
    },
    image: {
      title: 'סטודיו לתמונות',
      subtitle: 'צור תמונות איכותיות עם Gemini.',
      placeholder: 'תאר את התמונה שברצונך ליצור...',
      aspectRatio: {
        square: 'ריבוע (1:1)',
        landscape169: 'לרוחב (16:9)',
        portrait916: 'לאורך (9:16)',
        portrait34: 'לאורך (3:4)',
        landscape43: 'לרוחב (4:3)'
      },
      generate: 'צור תמונה',
      creating: 'יוצר...',
      download: 'הורד'
    },
    video: {
      title: 'סטודיו לווידאו',
      subtitle: 'צור סרטונים מטקסט עם Veo.',
      promptLabel: 'תיאור הסרטון',
      promptPlaceholder: 'תאר את הסרטון שברצונך ליצור...',
      aspectLabel: 'יחס תצוגה',
      resLabel: 'רזולוציה',
      generate: 'צור סרטון',
      generating: 'מייצר...',
      status: {
        init: 'מאתחל...',
        waitingKey: 'ממתין לבחירת מפתח API...',
        submitting: 'שולח בקשה...',
        dreaming: 'חולם פיקסלים...',
        done: 'הסרטון מוכן!'
      },
      generatedBy: 'נוצר ע״י Veo',
      download: 'הורד MP4'
    }
  }
};
