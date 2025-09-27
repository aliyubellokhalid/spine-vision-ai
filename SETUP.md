# 🏥 Spine Vision AI - Setup Guide

## 🚀 Quick Start

This is a comprehensive AI-powered spine MRI analysis application built with React, TypeScript, and OpenAI Vision API.

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Supabase account (optional)

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/aliyubellokhalid/spine-vision-ai.git
cd spine-vision-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start the development server**
```bash
npm run dev
```

## 🔧 Environment Setup

### OpenAI API Key
The OpenAI API key is already configured in `.env.local`:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Supabase Configuration
The Supabase client is already configured with:
- URL: `https://yoyozcrcazwxpszlrdzd.supabase.co`
- API Key: Already set in `src/integrations/supabase/client.ts`

## 🏗️ Database Setup (Optional)

If you want to use Supabase for data persistence:

1. **Run the database schema**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the `supabase_updated_schema.sql` script

2. **Update environment variables**
   - Add your Supabase URL and API key to the client configuration

## 🎯 Features

### ✅ Core Functionality
- **AI-Powered Analysis**: OpenAI Vision API for MRI analysis
- **Comprehensive Reports**: Detailed medical findings and recommendations
- **Patient Management**: Add and manage patient information
- **Real-time Processing**: Instant analysis results
- **Professional UI**: Modern, medical-grade interface

### 🔬 Analysis Capabilities
- **General Observations**: Spinal alignment, disc spaces, canal assessment
- **Pathology Detection**: Automated identification of spine conditions
- **Clinical Implications**: Symptom correlation and clinical significance
- **Treatment Recommendations**: AI-generated next steps and care plans
- **Confidence Scoring**: Reliability metrics for each finding

### 📊 Data Management
- **Local Storage**: Immediate results with localStorage fallback
- **Database Integration**: Supabase for persistent data storage
- **Export Capabilities**: Download and share analysis reports
- **Patient History**: Track multiple scans per patient

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI Integration**: OpenAI GPT-4 Vision API
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks, Context API
- **File Handling**: Base64 encoding for image processing

## 📁 Project Structure

```
spine-vision-ai/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── services/           # API services (OpenAI, Supabase)
│   ├── integrations/      # External service integrations
│   └── hooks/              # Custom React hooks
├── supabase/               # Database migrations
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables

## 🔒 Security Notes

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env.local` for local development
- **Data Privacy**: Patient data is handled securely with proper encryption

## 🐛 Troubleshooting

### Common Issues
1. **OpenAI API Errors**: Check API key and quota limits
2. **Supabase Connection**: Verify database URL and API key
3. **Image Upload**: Ensure file size is under 20MB
4. **Analysis Failures**: Check console for detailed error messages

### Debug Mode
Enable detailed logging by opening browser console (F12) to see:
- API connection status
- Analysis progress
- Data flow between components
- Error details and stack traces

## 📞 Support

For technical support or feature requests:
- Create an issue on GitHub
- Check the troubleshooting section
- Review console logs for error details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for medical professionals and AI-powered healthcare solutions.**