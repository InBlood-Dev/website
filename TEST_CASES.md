# Consumer Website - Test Cases

## 1. Public Pages (Unauthenticated)

### 1.1 Landing Page (`/`)
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.1.1 | Page load | Navigate to / | Hero section, features, stats, animations render |
| 1.1.2 | Feature showcase | Scroll to features section | 6 major features displayed correctly |
| 1.1.3 | Statistics display | Scroll to stats section | Shows 50K+ users, 10K+ matches, 4.8 rating |
| 1.1.4 | Orbiting animation | View animation section | Animation renders smoothly |
| 1.1.5 | Sign In button | Click "Sign In" | Navigate to login page |
| 1.1.6 | Get Started button | Click "Get Started" | Navigate to onboarding/signup |
| 1.1.7 | Footer links | Click each footer link | Navigate to correct page |
| 1.1.8 | Social links | Click social links in footer | Open correct external pages |

### 1.2 Onboarding Flow (`/onboarding`)
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.2.1 | Carousel slides | View onboarding | 5 slides shown: Welcome, Swipe & Match, Discover Nearby, Safe & Verified, Ready to Start |
| 1.2.2 | Next navigation | Click Next on each slide | Advances to next slide |
| 1.2.3 | Skip navigation | Click Skip | Skips to login/signup |
| 1.2.4 | Progress indicators | Navigate through slides | Progress dots update correctly |
| 1.2.5 | Last slide CTA | Reach final slide | Shows "Get Started" or equivalent CTA |

### 1.3 Login Page (`/login`)
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.3.1 | Google OAuth login | Click Google sign-in button | Google OAuth flow initiates |
| 1.3.2 | Successful Google login (existing user) | Complete Google OAuth | Redirect to /home |
| 1.3.3 | Successful Google login (new user) | Complete Google OAuth (new account) | Redirect to /setup (profile wizard) |
| 1.3.4 | Failed Google login | Cancel or fail Google OAuth | Error message displayed |
| 1.3.5 | Terms link | Click Terms link | Navigate to /terms |
| 1.3.6 | Privacy link | Click Privacy link | Navigate to /privacy |

### 1.4 Pricing Page (`/pricing`)
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.4.1 | Plans display | Navigate to /pricing | 3 tiers shown: Free, Premium, Premium Plus |
| 1.4.2 | Feature comparison | View pricing table | Feature comparison table renders correctly |
| 1.4.3 | FAQ section | Scroll to FAQ | FAQ questions and answers displayed |
| 1.4.4 | CTA buttons | Click plan CTA buttons | Navigate to signup/upgrade |

### 1.5 Static Pages
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.5.1 | About page | Navigate to /about | Company info and mission displayed |
| 1.5.2 | Privacy Policy | Navigate to /privacy | Privacy terms displayed |
| 1.5.3 | Terms of Service | Navigate to /terms | Terms and conditions displayed |

---

## 2. Profile Setup Wizard (`/setup`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.1 | Step 1 - Basics | Enter name, age, pronouns | Fields validated, proceed to next step |
| 2.2 | Step 1 - Name validation | Leave name empty | Validation error shown |
| 2.3 | Step 1 - Age validation | Enter age < 18 | Validation error shown |
| 2.4 | Step 2 - Gender selection | Select gender option | Gender saved, proceed |
| 2.5 | Step 3 - Sexual orientation | Select orientation | Orientation saved, proceed |
| 2.6 | Step 4 - Relationship types | Select up to 3 relationship types | Selected types saved |
| 2.7 | Step 4 - Max relationship types | Try to select more than 3 | Only 3 allowed |
| 2.8 | Step 5 - Photo upload | Upload 1-6 photos | Photos uploaded with preview |
| 2.9 | Step 5 - Minimum photo | Try to proceed with 0 photos | Validation error requiring at least 1 |
| 2.10 | Step 5 - Maximum photos | Try to upload more than 6 | Upload blocked or error |
| 2.11 | Step 6 - Bio writing | Enter bio text | Bio saved |
| 2.12 | Step 7 - Interest tags | Select interest tags | Tags saved |
| 2.13 | Step 8 - Match preferences | Set age range, distance, gender preference | Preferences saved |
| 2.14 | Progress indicator | Navigate through steps | Progress bar updates correctly |
| 2.15 | Complete setup | Finish all steps | Redirect to /home |
| 2.16 | Form validation per step | Skip required fields | Cannot proceed without required fields |

---

## 3. Home / Feed Page (`/home`)

### 3.1 Stories
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.1.1 | Stories carousel | Load home page | Horizontal scrollable stories carousel shown |
| 3.1.2 | View a story | Click on a user's story | Story opens in viewer |
| 3.1.3 | Create story button | Click "My Story" button | Story creation flow starts |
| 3.1.4 | Story expiration | View stories section | Only stories from last 24 hours shown |

### 3.2 Dates & Profiles
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.2.1 | Your Dates section | Load home page | Horizontal scroll of profile cards shown |
| 3.2.2 | Profile card tap | Tap a profile card | Navigate to user's profile page |
| 3.2.3 | Explore More link | Click "Explore More" | Navigate to /discover |
| 3.2.4 | Online status indicator | View profile cards | Online users show green indicator |
| 3.2.5 | Distance display | View profile cards | Distance shown on cards |

### 3.3 Nearby Map
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.3.1 | Map preview | Load home page | Nearby map preview section shown |
| 3.3.2 | Open map modal | Click map preview | Interactive map modal opens |
| 3.3.3 | Nearby users grid | View nearby section | 8+ profiles visible in grid |
| 3.3.4 | Location required | Load page without location | Prompt to enable location |

### 3.4 Search & Filter
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.4.1 | Search functionality | Type in search bar | Results filter by query |
| 3.4.2 | Filter button | Click filter button | Filter modal opens |
| 3.4.3 | Age filter slider | Adjust age range sliders | Results filtered by age range |
| 3.4.4 | Distance filter slider | Adjust distance slider | Results filtered by distance |
| 3.4.5 | Real-time updates | Wait on home page | New data loads without manual refresh |

---

## 4. Discover / Explore Page (`/discover`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.1 | Gallery load | Navigate to /discover | Grid layout of profile cards loaded |
| 4.2 | Infinite scroll | Scroll to bottom | More profiles load automatically |
| 4.3 | Mobile drag gesture | Drag 360 degrees on mobile | Infinite drag gesture supported |
| 4.4 | Desktop grid | View on desktop | Traditional scrollable grid (4-5 cols) |
| 4.5 | Mobile grid | View on mobile | 3-column grid layout |
| 4.6 | Profile card display | View cards | Shows photo, name, age, distance, online status |
| 4.7 | Relationship type borders | View cards | Colored borders based on relationship type |
| 4.8 | Filter modal - Online only | Toggle "Online only" filter | Only online users shown |
| 4.9 | Filter modal - Relationship type | Select relationship type | Only matching users shown |
| 4.10 | Search with debounce | Type in search | Search triggers after debounce period |
| 4.11 | Click profile card | Click on a profile | Navigate to profile detail page |
| 4.12 | Location requirement | Visit without location permission | Location prompt shown |
| 4.13 | Lazy loading | Scroll through many profiles | Images load lazily |
| 4.14 | Empty state | No profiles match filters | Empty state message shown |

---

## 5. Swipe / Feed Page (`/feed`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.1 | Card stack load | Navigate to /feed | Card stack displayed with current and next preview |
| 5.2 | Swipe right (Like) | Swipe card right | Like sent, next card shown |
| 5.3 | Swipe left (Pass) | Swipe card left | Pass recorded, next card shown |
| 5.4 | Swipe up (Super Like) | Swipe card up | Super Like sent, next card shown |
| 5.5 | Like button | Click Like button | Like sent, next card shown |
| 5.6 | Pass button | Click Pass button | Pass recorded, next card shown |
| 5.7 | Super Like button | Click Super Like button | Super Like sent, next card shown |
| 5.8 | Undo button | Click Undo after swiping | Previous card restored |
| 5.9 | Keyboard - Right arrow | Press right arrow key | Like action triggered |
| 5.10 | Keyboard - Left arrow | Press left arrow key | Pass action triggered |
| 5.11 | Keyboard - Up arrow | Press up arrow key | Super Like action triggered |
| 5.12 | Match notification | Like a user who liked you back | Match modal/notification appears |
| 5.13 | Daily swipe limit | Exhaust daily swipes | Limit indicator shown, swiping disabled |
| 5.14 | Swipe limit progress bar | Use some swipes | Progress bar updates |
| 5.15 | Super Like limit | Exhaust daily super likes | Super like button disabled |
| 5.16 | No more profiles | All profiles exhausted | "No profiles" state with refresh button |
| 5.17 | Refresh profiles | Click refresh on empty state | New profiles loaded (if available) |
| 5.18 | Card preview | View card stack | Next card partially visible behind current |

---

## 6. Profile Viewing (`/profile/[userId]`)

### 6.1 Photo Gallery
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.1.1 | Main photo | Open profile | Large main photo displayed |
| 6.1.2 | Thumbnail grid | View profile | Up to 6 additional thumbnails shown |
| 6.1.3 | Photo viewer modal | Click a photo | Full-size photo opens in modal |
| 6.1.4 | Photo navigation | Navigate in photo viewer | Previous/next photos accessible |
| 6.1.5 | Image indicators | View photo viewer | Counter shows current/total photos |

### 6.2 User Information
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.2.1 | Basic info | View profile | Shows name, age, pronouns |
| 6.2.2 | Gender display | View profile | Gender shown |
| 6.2.3 | Location & distance | View profile | Location and distance from current user shown |
| 6.2.4 | Relationship types | View profile | Colored badges for relationship types |
| 6.2.5 | Sexual orientation | View profile | Orientation displayed |
| 6.2.6 | Bio section | View profile | Bio text displayed |
| 6.2.7 | Tags/Interests | View profile | Interest tags displayed |
| 6.2.8 | Prompts | View profile | Q&A responses displayed |
| 6.2.9 | Verification badge | View verified user | Verification badge shown |
| 6.2.10 | Statistics | View profile | Seductions and likes counts shown |

### 6.3 Actions
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.3.1 | Like button | Click Like | Like sent to user |
| 6.3.2 | Super Like button | Click Super Like | Super Like sent |
| 6.3.3 | Pass button | Click Pass | User passed |
| 6.3.4 | Chat button (if matched) | Click Chat on matched user | Navigate to chat with that user |
| 6.3.5 | Mobile action bar | View on mobile | Fixed bottom action bar shown |
| 6.3.6 | Desktop layout | View on desktop | Two-column layout |
| 6.3.7 | Profile view tracking | Visit a profile | View tracked in backend |

---

## 7. My Profile Page (`/profile`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.1 | Profile strength | View my profile | Strength bar and percentage shown |
| 7.2 | Stats capsule | View my profile | Seductions and likes counts displayed |
| 7.3 | Profile photo | Click profile photo | Photo gallery opens |
| 7.4 | Basic info display | View my profile | Name, age, verification, pronouns, location shown |
| 7.5 | Matches count badge | View my profile | Matches count badge displayed |
| 7.6 | Bento cards - Bio | View my profile | Bio bento card shown |
| 7.7 | Bento cards - Orientation | View my profile | Sexual orientation card shown |
| 7.8 | Bento cards - Tags | View my profile | Interest tags card shown |
| 7.9 | Bento cards - Prompts | View my profile | Up to 3 prompts shown |
| 7.10 | Bento cards - Opening moves | View my profile | Opening moves card shown |
| 7.11 | Bento cards - Languages | View my profile | Languages card shown |
| 7.12 | Bento cards - Photos | View my profile | Photos grid shown |
| 7.13 | Premium status | View profile (premium user) | Premium status card shown |
| 7.14 | Premium upgrade prompt | View profile (free user) | Upgrade prompt shown |
| 7.15 | Quick actions | View my profile | Safety, Help, Settings actions available |
| 7.16 | Edit Profile button | Click Edit Profile | Navigate to /profile/edit |
| 7.17 | Version display | View my profile | App version shown |

---

## 8. Edit Profile Page (`/profile/edit`)

### 8.1 Photo Management
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.1.1 | Upload photo | Click add photo, select file | Photo uploaded with preview |
| 8.1.2 | Replace photo | Click existing photo, select "Replace" | Photo replaced |
| 8.1.3 | Set primary photo | Click photo, select "Set as primary" | Photo set as primary |
| 8.1.4 | Delete photo | Click photo, select "Delete" | Photo removed |
| 8.1.5 | Maximum 6 photos | Try to add 7th photo | Upload blocked |
| 8.1.6 | Minimum 1 photo | Try to delete last photo | Deletion blocked or warning |
| 8.1.7 | Photo options modal | Click on a photo | Options modal shown (Replace, Set Primary, Delete) |

### 8.2 Text Fields
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.2.1 | Edit name | Change name, save | Name updated |
| 8.2.2 | Edit bio | Change bio text | Bio updated |
| 8.2.3 | Bio character counter | Type in bio field | Character count updates |
| 8.2.4 | Bio max length | Exceed bio character limit | Input blocked at limit |

### 8.3 Dropdown Selectors
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.3.1 | Change sexual orientation | Select from 20+ options | Orientation updated |
| 8.3.2 | Change pronouns | Select from 9 options | Pronouns updated |

### 8.4 Profile Prompts
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.4.1 | Add prompt | Select from 16 pre-defined prompts | Prompt added with text input |
| 8.4.2 | Answer prompt | Type answer to prompt | Answer saved |
| 8.4.3 | Remove prompt | Click remove on a prompt | Prompt removed |
| 8.4.4 | Max prompts | Check prompt limit | Cannot exceed maximum prompts |

### 8.5 Opening Moves
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.5.1 | Select opening move | Choose from 5 pre-defined moves | Move selected |
| 8.5.2 | Answer opening move | Type answer | Answer saved |
| 8.5.3 | Remove opening move | Remove selected move | Move removed |

### 8.6 Languages
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.6.1 | Add language | Select from 20+ languages | Language added |
| 8.6.2 | Remove language | Deselect a language | Language removed |
| 8.6.3 | Multiple languages | Select several languages | All selected languages saved |

### 8.7 Tags/Interests
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.7.1 | View tag categories | Open tags section | Tags grouped by category |
| 8.7.2 | Toggle tag on | Click unselected tag | Tag selected |
| 8.7.3 | Toggle tag off | Click selected tag | Tag deselected |
| 8.7.4 | Multi-select tags | Select multiple tags | All selected tags saved |

### 8.8 Match Preferences
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.8.1 | Set min age | Adjust min age slider | Min age updated |
| 8.8.2 | Set max age | Adjust max age slider | Max age updated |
| 8.8.3 | Set max distance | Adjust distance slider | Distance updated |
| 8.8.4 | Min age < max age validation | Try to set min > max | Validation prevents or auto-corrects |

### 8.9 Save & Strength
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.9.1 | Save changes | Click Save | Profile updated, loading state shown |
| 8.9.2 | Profile strength tracking | Complete more profile fields | Strength indicator increases |

---

## 9. Matches / Messages Page (`/matches`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 9.1 | Page load | Navigate to /matches | Header, new matches, conversations shown |
| 9.2 | New Matches carousel | View new matches section | Horizontal scroll of new match cards |
| 9.3 | Like count card | View new matches | Like count prominently displayed |
| 9.4 | Match profile cards | View new matches | Photo thumbnails for each match |
| 9.5 | Pinned conversations | View pinned section | Pinned conversations shown separately |
| 9.6 | Active conversations | View conversations | Sorted by most recent message |
| 9.7 | Chat item display | View conversation item | Shows avatar, name, last message preview, timestamp |
| 9.8 | "You: " prefix | View sent message preview | Last message shows "You: " prefix |
| 9.9 | Unread count badge | Receive messages | Unread count badge shown on conversation |
| 9.10 | Pin indicator | View pinned conversation | Pin icon shown |
| 9.11 | NEW badge | View new match without conversation | NEW badge shown |
| 9.12 | Click conversation | Click on a conversation item | Navigate to /chat/[conversationId] |
| 9.13 | Click new match | Click on new match card | Navigate to chat or profile |
| 9.14 | Empty state | No matches yet | Empty state message shown |
| 9.15 | Skeleton loading | First page load | Skeleton placeholders shown |
| 9.16 | Real-time updates | Receive new message while on page | Conversation list updates via Firebase |

---

## 10. Chat / Conversation Page (`/chat/[conversationId]`)

### 10.1 Chat Header
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.1.1 | Back button | Click back | Navigate back to /matches |
| 10.1.2 | User profile info | View header | Shows user name, photo, clickable |
| 10.1.3 | Click profile in header | Click user name/photo | Navigate to user's profile |
| 10.1.4 | Online status | View header (user online) | Shows online status |
| 10.1.5 | Typing status | Other user is typing | "Typing..." shown in header |
| 10.1.6 | Menu button | Click menu button | Dropdown menu opens |

### 10.2 Messages
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.2.1 | Send text message | Type message, press Enter | Message sent, appears in chat |
| 10.2.2 | Receive message | Other user sends message | Message appears in real-time |
| 10.2.3 | Message bubbles | View sent/received messages | Different colors for sent vs received |
| 10.2.4 | Timestamp grouping | View messages with time gaps | Timestamps shown on sender change or 5+ min gap |
| 10.2.5 | Message status - sending | Send a message | Sending indicator shown |
| 10.2.6 | Message status - sent | Message sent to server | Sent indicator shown |
| 10.2.7 | Message status - delivered | Message delivered | Delivered indicator shown |
| 10.2.8 | Message status - seen | Message read by recipient | Seen indicator shown |
| 10.2.9 | Opening move card | First message with opening move | Special formatted card shown |
| 10.2.10 | Deleted message | View deleted message | "Message deleted" state shown |
| 10.2.11 | Character limit | Type 1000+ chars | Input stops at 1000 characters |

### 10.3 Typing Indicator
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.3.1 | Show typing | Other user starts typing | Typing indicator appears |
| 10.3.2 | Broadcast typing | Start typing | Typing status sent to other user |
| 10.3.3 | Stop typing indicator | Other user stops typing | Typing indicator disappears |

### 10.4 Message Actions
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.4.1 | Delete for me | Right-click message, select "Delete for me" | Message removed from your view |
| 10.4.2 | Delete for everyone (own message, < 1 hour) | Right-click own recent message, "Delete for everyone" | Message deleted for both users |
| 10.4.3 | Delete for everyone (own message, > 1 hour) | Right-click own old message | "Delete for everyone" not available |
| 10.4.4 | Delete countdown | View delete-for-everyone option | Shows remaining time countdown |
| 10.4.5 | Cannot delete others' for everyone | Right-click received message | Only "Delete for me" available |

### 10.5 Chat Menu
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.5.1 | Mute notifications | Click "Mute" in menu | Notifications muted for this conversation |
| 10.5.2 | Unmute notifications | Click "Unmute" in menu | Notifications unmuted |
| 10.5.3 | Block user | Click "Block" in menu | User blocked, conversation disabled |
| 10.5.4 | Report user | Click "Report" in menu | Report flow initiated |

### 10.6 Message Input
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.6.1 | Auto-grow textarea | Type long message | Input field expands vertically |
| 10.6.2 | Enter to send | Press Enter | Message sent |
| 10.6.3 | Shift+Enter for new line | Press Shift+Enter | New line added, message not sent |
| 10.6.4 | Send button | Click send button | Message sent |
| 10.6.5 | Empty message | Press Enter with empty input | No message sent |
| 10.6.6 | Optimistic sending | Send message | Message appears immediately before server confirms |

---

## 11. Likes Page (`/likes`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 11.1 | Premium user access | Navigate to /likes (premium user) | Grid of users who liked you |
| 11.2 | Free user access | Navigate to /likes (free user) | Premium upgrade prompt shown |
| 11.3 | Like card display | View like cards | Shows photo, name, age |
| 11.4 | Super like indicator | View super like card | Star icon shown |
| 11.5 | Click like card | Click on a like card | Navigate to user's profile |
| 11.6 | Empty state | No likes received | Empty state message shown |

---

## 12. Search Page (`/search`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 12.1 | Search bar | Navigate to /search | Persistent search bar displayed |
| 12.2 | Search by name | Type a user name | Results filtered with debounce (400ms) |
| 12.3 | Result display | View search results | Shows avatar, name, age, location, distance, verified badge |
| 12.4 | Click result | Click a search result | Navigate to user's profile |
| 12.5 | Empty query state | Visit page without typing | Default/empty state shown |
| 12.6 | No results | Search for non-existent user | "No results" message shown |
| 12.7 | Skeleton loading | Type search query | Skeleton loaders shown while fetching |

---

## 13. Settings Page (`/settings`)

### 13.1 Account Section
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.1.1 | Edit Profile link | Click "Edit Profile" | Navigate to /profile/edit |
| 13.1.2 | Premium upgrade link | Click premium link (free user) | Navigate to /premium |
| 13.1.3 | Blocked Users link | Click "Blocked Users" | Navigate to /settings/blocked |

### 13.2 Verification
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.2.1 | Verification status | View verification section | Shows current status (unverified/pending/verified) |
| 13.2.2 | Request verification | Click "Request Verification" | Verification flow starts |
| 13.2.3 | Pending status | After submitting verification | "Pending" status displayed |
| 13.2.4 | Verified status | Verification approved | "Verified" badge shown |

### 13.3 Privacy
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.3.1 | Incognito Mode toggle | Toggle incognito mode | Profile hidden/shown from discovery |
| 13.3.2 | Show Distance - Exact | Select "Exact" | Exact distance shown to others |
| 13.3.3 | Show Distance - Approximate | Select "Approximate" | Approximate distance shown |
| 13.3.4 | Show Distance - Hidden | Select "Hidden" | Distance hidden from others |

### 13.4 Discovery Preferences
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.4.1 | Interested in - Man | Select "Man" chip | Preference saved |
| 13.4.2 | Interested in - Woman | Select "Woman" chip | Preference saved |
| 13.4.3 | Interested in - Non-Binary | Select "Non-Binary" chip | Preference saved |
| 13.4.4 | Interested in - Everyone | Select "Everyone" chip | Preference saved |
| 13.4.5 | Min Age slider | Adjust min age | Min age updated |
| 13.4.6 | Max Age slider | Adjust max age | Max age updated |
| 13.4.7 | Max Distance slider | Adjust distance | Distance preference updated |
| 13.4.8 | Save Preferences | Click "Save Preferences" | All preferences saved |

### 13.5 Help & Support
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.5.1 | Help Center link | Click "Help Center" | Opens help page |
| 13.5.2 | Safety Tips link | Click "Safety Tips" | Opens safety tips |
| 13.5.3 | Terms & Privacy link | Click link | Navigate to terms/privacy page |

### 13.6 About Section
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.6.1 | App version | View about section | Version number displayed |
| 13.6.2 | Rate Us link | Click "Rate Us" | Opens app store review |
| 13.6.3 | Share InBlood link | Click "Share" | Share sheet/dialog opens |

### 13.7 Account Actions
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.7.1 | Logout button | Click Logout | Confirmation modal appears |
| 13.7.2 | Confirm logout | Click confirm on logout modal | User logged out, redirect to login |
| 13.7.3 | Cancel logout | Click cancel on logout modal | Modal closes, user stays logged in |

---

## 14. Blocked Users Page (`/settings/blocked`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 14.1 | View blocked users | Navigate to /settings/blocked | List of blocked users shown |
| 14.2 | Blocked user display | View list | Shows avatar, name, unblock button |
| 14.3 | Unblock user | Click "Unblock" | User unblocked, removed from list |
| 14.4 | Empty state | No blocked users | "No blocked users" message shown |

---

## 15. Premium / Subscription Page (`/premium`)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 15.1 | Hero section | Navigate to /premium | Crown icon and hero section shown |
| 15.2 | Subscription plans display | View plans | Plan name, price in INR, duration shown |
| 15.3 | Plan selection | Click on a plan | Plan highlighted/selected |
| 15.4 | Features list | View plan details | Included/excluded features shown with checkmarks |
| 15.5 | Feature - Unlimited Swipes | View Premium features | Listed correctly |
| 15.6 | Feature - See Who Likes You | View Premium features | Listed correctly |
| 15.7 | Feature - Super Likes | View Premium features | 5/day or unlimited shown |
| 15.8 | Feature - Boosts | View Premium features | 1-3/month shown |
| 15.9 | Feature - Rewind | View Premium features | Listed correctly |
| 15.10 | Feature - Priority Discovery | View Premium features | Listed correctly |
| 15.11 | Feature - Read Receipts | View Premium+ features | Listed as Premium+ only |
| 15.12 | Upgrade button | Click Upgrade | Payment flow initiates |
| 15.13 | Already Premium state | Visit page as premium user | Shows current plan and expiration date |
| 15.14 | Fallback plans | API fails to load plans | Default fallback plans shown |

---

## 16. Stories Feature

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 16.1 | Create photo story | Upload photo as story | Story created and visible |
| 16.2 | Create video story | Upload video as story | Story created and visible |
| 16.3 | View own story | Click own story | Story viewer opens |
| 16.4 | View other's story | Click other user's story | Story viewer opens |
| 16.5 | Story auto-expiry | Wait 24 hours | Story no longer visible |
| 16.6 | Story view count | View a story | View count increments |

---

## 17. Push Notifications

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 17.1 | Permission prompt | First app load | Notification permission requested |
| 17.2 | Grant permission | Click "Allow" | Notifications enabled |
| 17.3 | Deny permission | Click "Deny" | App works without notifications |
| 17.4 | New message notification | Receive message while app backgrounded | Push notification appears |
| 17.5 | New match notification | Receive a match | Push notification appears |
| 17.6 | Notification tap | Tap a notification | Opens relevant page (chat/matches) |

---

## 18. Safety Features

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 18.1 | Block user from profile | Click block on profile page | User blocked |
| 18.2 | Block user from chat | Click block in chat menu | User blocked, chat disabled |
| 18.3 | Report user from profile | Report from profile page | Report submitted |
| 18.4 | Report user from chat | Report from chat menu | Report submitted |
| 18.5 | Incognito mode | Enable incognito | Profile hidden from discovery |
| 18.6 | Incognito mode off | Disable incognito | Profile visible in discovery |
| 18.7 | Verification request flow | Submit verification selfie | Request submitted, pending status shown |

---

## 19. Location & Geolocation

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 19.1 | Location permission prompt | First use of location feature | Browser location permission requested |
| 19.2 | Grant location | Click "Allow" | Location-based features enabled |
| 19.3 | Deny location | Click "Deny" | Graceful degradation, location features limited |
| 19.4 | Distance calculation | View nearby profiles | Accurate distance shown |
| 19.5 | Location update | Move to new location | Distance calculations update |

---

## 20. Responsive Design & Cross-Platform

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 20.1 | Mobile layout | View on mobile device | Mobile-optimized layout |
| 20.2 | Desktop layout | View on desktop | Desktop-optimized layout |
| 20.3 | Tablet layout | View on tablet | Appropriate layout adaptation |
| 20.4 | Touch gestures (mobile) | Use swipe gestures | Smooth gesture handling |
| 20.5 | Keyboard navigation (desktop) | Use keyboard shortcuts | Arrow keys work on feed page |
| 20.6 | Loading states | Navigate between pages | Skeleton loaders shown appropriately |
| 20.7 | Error handling | Simulate network failure | Error states shown gracefully |
| 20.8 | Offline state | Lose network connection | Appropriate offline message |
