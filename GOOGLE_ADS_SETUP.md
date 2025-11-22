# Google Ads Conversion Tracking Setup Guide

## Current Status
✅ Google Analytics 4 (GA4) is installed
✅ Conversion tracking code structure is ready
⏳ Need to add your Google Ads Conversion ID

---

## Step-by-Step Setup Instructions

### Step 1: Get Your Google Ads Conversion ID & Label

1. **Log in to Google Ads** (https://ads.google.com)
2. Click **Goals** in the left menu
3. Click **Conversions**
4. Click **+ New conversion action**
5. Select **Website**
6. Choose **Manually create conversion actions with code**
7. Enter conversion details:
   - **Category**: Lead or Sign-up
   - **Conversion name**: "WhatsApp Click" or "Lead Form Submit"
   - **Value**: Use the same value for each conversion
   - **Count**: Every (track all clicks)
   - **Click-through conversion window**: 30 days
   - **View-through conversion window**: 1 day
8. Click **Create and continue**
9. Select **Use Google tag**
10. You'll see two IDs:
    - **Conversion ID**: `AW-XXXXXXXXXX` (10-11 digits)
    - **Conversion Label**: `YYYYYYYYYYYY` (random string)

### Step 2: Update Your Website Code

Open `frontend/index.html` and find these TWO locations to update:

**Location 1 - Line ~1525:** Replace `AW-XXXXXXXXXX` with your actual Conversion ID
```javascript
gtag('config', 'AW-1234567890');  // Your actual ID here
```

**Location 2 - Line ~1535:** Replace both `AW-XXXXXXXXXX` and `YYYYYYYYYYYY`
```javascript
gtag('event', 'conversion', {
    'send_to': 'AW-1234567890/AbC-dEfGhIjKlMnOpQrS',  // Your ID/Label
    'value': 1.0,
    'currency': 'USD',
    'event_callback': callback,
    'event_timeout': 2000
});
```

**⚠️ IMPORTANT:** You need to replace the IDs in BOTH locations with the same values!

### Step 3: Verify Conversion Tracking

1. **Install Google Tag Assistant** (Chrome extension)
2. Visit your website: https://textexpense.com
3. Click a WhatsApp button
4. Check Tag Assistant - you should see:
   - ✅ Google Analytics 4 tag firing
   - ✅ Google Ads Conversion tag firing
5. In Google Ads, go to **Conversions** and check for "Recent conversions" (may take 24 hours)

### Step 4: Link Google Ads to GA4 (Optional but Recommended)

1. In Google Ads, go to **Tools & Settings** > **Linked accounts**
2. Find **Google Analytics 4** and click **Link**
3. Select your GA4 property (`G-HMSDHWE3BS`)
4. Enable **Import conversions** and **Personalized advertising**
5. Click **Link**

### Step 5: Import GA4 Events as Conversions (Optional)

1. In Google Ads, go to **Goals** > **Conversions**
2. Click **+ New conversion action**
3. Select **Import** > **Google Analytics 4 properties**
4. Select your GA4 property
5. Check **whatsapp_click** event
6. Click **Import and continue**

---

## What Gets Tracked?

### Current Tracking Events:

1. **Page Views** (automatic via GA4)
2. **WhatsApp Button Clicks** (custom event)
   - Tracked locations: hero, header, footer_cta, footer_main
   - Sends to both GA4 AND Google Ads
3. **Conversions** (Google Ads)
   - Fires on every WhatsApp button click
   - Value: $1.00 USD (you can change this)

---

## Troubleshooting

### "Conversions not recording"
- Wait 24-48 hours for Google Ads to process
- Check Tag Assistant to verify tags fire
- Make sure Conversion ID and Label are correct

### "No recent conversions"
- Test by clicking WhatsApp buttons yourself
- Check Google Ads > Conversions > Recent conversions
- Ensure you're using the correct Conversion ID format

### "Unable to verify conversion tag"
- Clear browser cache
- Check browser console for errors (F12)
- Ensure gtag.js is loaded before conversion code

---

## Quick Reference

**Your Current IDs:**
- GA4 Measurement ID: `G-HMSDHWE3BS`
- Google Ads Conversion ID: `AW-XXXXXXXXXX` (⚠️ NEEDS TO BE UPDATED)
- Google Ads Conversion Label: `YYYYYYYYYYYY` (⚠️ NEEDS TO BE UPDATED)

**Files Modified:**
- `frontend/index.html` (lines 1512-1526, 2186-2195)

---

## Need Help?

If you're stuck, message me the following:
1. Screenshot of your Google Ads Conversion setup page
2. Your Conversion ID and Label (they're safe to share)
3. Any error messages from browser console

I'll help you get it working!
