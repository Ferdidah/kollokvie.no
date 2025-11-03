# Routing Issue Analysis - Emne Pages Not Displayable

## Problem Summary

After merging remote changes, the emne routes were moved from `/emner/` to `/dashboard/emner/`, but **all links and navigation still reference the old paths**. This causes broken links and 404 errors.

## Current File Structure

```
app/src/app/
├── dashboard/
│   ├── emner/
│   │   ├── [emneId]/
│   │   │   ├── page.tsx              → /dashboard/emner/[emneId]
│   │   │   ├── layout.tsx
│   │   │   ├── mote/
│   │   │   │   ├── page.tsx          → /dashboard/emner/[emneId]/mote
│   │   │   │   └── [moteId]/
│   │   │   │       └── page.tsx      → /dashboard/emner/[emneId]/mote/[moteId]
│   │   │   └── kunnskapsbank/
│   │   │       ├── page.tsx          → /dashboard/emner/[emneId]/kunnskapsbank
│   │   │       └── [docId]/
│   │   │           └── page.tsx      → /dashboard/emner/[emneId]/kunnskapsbank/[docId]
│   │   └── page.tsx                  → /dashboard/emner
```

**Actual Routes (where files exist):**
- ✅ `/dashboard/emner` - List page
- ✅ `/dashboard/emner/[emneId]` - Emne detail page
- ✅ `/dashboard/emner/[emneId]/mote` - Meetings list
- ✅ `/dashboard/emner/[emneId]/mote/[moteId]` - Meeting detail
- ✅ `/dashboard/emner/[emneId]/kunnskapsbank` - Knowledge base
- ✅ `/dashboard/emner/[emneId]/kunnskapsbank/[docId]` - Document view

## The Problem

### 1. **EmneNav Component** (`components/navigation/EmneNav.tsx`)
**Current (WRONG):**
```typescript
href: `/emner/${emne.id}`           // ❌ Should be `/dashboard/emner/${emne.id}`
href: `/emner/${emne.id}/mote`      // ❌ Should be `/dashboard/emner/${emne.id}/mote`
href: `/emner/${emne.id}/kunnskapsbank` // ❌ Should be `/dashboard/emner/${emne.id}/kunnskapsbank`
// ... all nav items use old paths
```

### 2. **GlobalNav Component** (`components/navigation/GlobalNav.tsx`)
**Current (WRONG):**
```typescript
<Link href="/emner">  // ❌ Should be `/dashboard/emner` or `/dashboard`
```

### 3. **Dashboard Emner List Page** (`dashboard/emner/page.tsx`)
**Current (WRONG):**
```typescript
<Link href={`/emner/${emne.id}`}>  // ❌ Should be `/dashboard/emner/${emne.id}`
<Link href="/emner/new">           // ❌ Should be `/dashboard/emner/new`
```

### 4. **Emne Detail Page** (`dashboard/emner/[emneId]/page.tsx`)
**Current (WRONG):**
```typescript
<Link href={`/emner/${emneId}/mote/${nextMeeting.id}`}>  // ❌ Wrong path
<Link href={`/emner/${emneId}/kunnskapsbank`}>           // ❌ Wrong path
```

### 5. **Emne Layout** (`dashboard/emner/[emneId]/layout.tsx`)
**Current (WRONG):**
```typescript
redirect('/emner')  // ❌ Should redirect to `/dashboard/emner`
```

### 6. **Other Pages**
- Meeting pages (`mote/page.tsx`, `mote/[moteId]/page.tsx`) use old paths
- Knowledge base pages use old paths
- Home page (`page.tsx`) links to `/emner` (old path)

## Complete List of Files Needing Updates

### High Priority (Navigation)
1. ✅ `components/navigation/EmneNav.tsx` - ALL nav links (7 items)
2. ✅ `components/navigation/GlobalNav.tsx` - "Mine Emner" link
3. ✅ `app/dashboard/emner/[emneId]/layout.tsx` - Redirect path

### Medium Priority (Page Links)
4. ✅ `app/dashboard/emner/page.tsx` - Emne card links, "new" links
5. ✅ `app/dashboard/emner/[emneId]/page.tsx` - Meeting links, KB links
6. ✅ `app/dashboard/emner/[emneId]/mote/page.tsx` - Meeting detail links
7. ✅ `app/dashboard/emner/[emneId]/mote/[moteId]/page.tsx` - Back link
8. ✅ `app/dashboard/emner/[emneId]/kunnskapsbank/page.tsx` - Doc links
9. ✅ `app/dashboard/emner/[emneId]/kunnskapsbank/[docId]/page.tsx` - Back link

### Low Priority (Other)
10. ✅ `app/page.tsx` - Home page link to emner
11. ✅ `app/dashboard/page.tsx` - Already correct! ✅

## Solution Strategy

### Option 1: Update All Links (Recommended)
**Update all references from `/emner/...` to `/dashboard/emner/...`**

**Pros:**
- Matches actual file structure
- Clear routing hierarchy
- Consistent with dashboard layout

**Cons:**
- Many files to update
- URLs are longer

### Option 2: Create Redirect Routes
**Keep old routes but redirect to new ones**

**Pros:**
- Backward compatible
- Shorter URLs still work

**Cons:**
- More complex routing
- Doesn't fix the root issue

### Option 3: Move Files Back
**Move files from `/dashboard/emner/` back to `/emner/`**

**Pros:**
- No link updates needed
- Shorter URLs

**Cons:**
- Reverses remote merge changes
- Inconsistent with dashboard structure

## Recommended Fix

**Option 1** - Update all links to match the actual file structure.

**Files to update:**
1. `EmneNav.tsx` - Change all 7 nav items from `/emner/...` to `/dashboard/emner/...`
2. `GlobalNav.tsx` - Change `/emner` to `/dashboard/emner` or `/dashboard`
3. `layout.tsx` - Change redirect from `/emner` to `/dashboard/emner`
4. All page files - Update internal links systematically

**Pattern to follow:**
```typescript
// OLD ❌
href={`/emner/${emneId}/mote`}

// NEW ✅
href={`/dashboard/emner/${emneId}/mote`}
```

## Testing Checklist

After fixes:
- [ ] Can navigate to emne list from dashboard
- [ ] Can click on emne card to view details
- [ ] EmneNav sidebar links work
- [ ] Can navigate to meetings, knowledge base, etc.
- [ ] "Back" links work correctly
- [ ] Can create new emne
- [ ] Redirects work when not a member

