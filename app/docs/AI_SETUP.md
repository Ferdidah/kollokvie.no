# AI Setup Guide - Using OpenAI SDK

## Quick Setup

### 1. Install Dependencies

Already installed! The `openai` package is in your `package.json`.

### 2. Set Environment Variables

Add these to your `.env.local` file in the `app` directory:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional Settings
OPENAI_MODEL=gpt-4-turbo-preview  # or gpt-3.5-turbo for cheaper/faster
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

**Get your API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy it to your `.env.local` file

### 3. How to Use

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to an emne's Kunnskapsbank:**
   - Go to `/dashboard/emner/[emneId]/kunnskapsbank`
   - You'll see the "AI Dokumentgenerator" component

3. **Generate a document:**
   - Select generation type (Synteser, Spørsmål, or Analyse)
   - Optionally add a custom prompt
   - Click "Generer med AI"
   - Wait 5-15 seconds
   - The document will appear in the list!

### 4. Generation Types

- **Synteser notater til masterdokument**: Creates a comprehensive knowledge base from all notes
- **Generer diskusjonsspørsmål**: Generates 10-15 discussion questions
- **Analyser kunnskapshull**: Identifies knowledge gaps and areas for improvement

## Troubleshooting

### "OPENAI_API_KEY is not set"
- Make sure `.env.local` exists in the `app` directory
- Check that the variable name is exactly `OPENAI_API_KEY`
- Restart your dev server after adding the variable

### "AI generation failed"
- Check your API key is valid
- Ensure you have credits in your OpenAI account
- Check server logs for detailed error messages

### "Not a member of this emne"
- You must be a member of the emne to generate documents
- Ask an admin to add you to the emne

## Cost Notes

- **GPT-4-turbo**: ~$0.05-0.15 per request (higher quality)
- **GPT-3.5-turbo**: ~$0.002-0.005 per request (cheaper, faster)

To use GPT-3.5-turbo, set:
```bash
OPENAI_MODEL=gpt-3.5-turbo
```

## File Structure

```
app/src/
├── app/
│   └── api/
│       └── ai/
│           └── generate/
│               └── route.ts  # API endpoint using OpenAI SDK
└── components/
    └── ai/
        └── DocumentGenerator.tsx  # UI component
```

That's it! Simple and straightforward. 🚀

