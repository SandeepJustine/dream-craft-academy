import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple hash matching the API's hash function (reversed + salt + base64)
const passwordHash = Buffer.from('demo123'.split('').reverse().join('') + '::dreamcraft-salt').toString('base64');

// ─── Helper: future date ────────────────────────────────────────────
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ─── COURSE DATA ────────────────────────────────────────────────────
const coursesData = [
  {
    title: 'Foundations of Christian Faith',
    description:
      'A comprehensive introduction to the core beliefs of Christianity. Explore the essentials of the Gospel, the nature of God, salvation through Christ, and the transformative power of faith. Perfect for new believers and those seeking to strengthen their spiritual foundation.',
    category: 'Life Coaching',
    level: 'Beginner',
    duration: '8 weeks',
    instructor: 'Dr. Samuel Mensah',
    featured: true,
    enrolled: 234,
    rating: 4.8,
    image: '/images/foundations.jpg',
    modules: [
      {
        title: 'The Nature of God',
        description: 'Understanding who God is — His attributes, character, and triune nature.',
        order: 0,
        lessons: [
          {
            title: 'Knowing God: The Starting Point of Faith',
            type: 'video',
            duration: '25 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'The Bible declares that knowing God is the most important pursuit of human life. Jeremiah 9:23-24 says, "Let not the wise man glory in his wisdom, let not the mighty man glory in his might, nor let the rich man glory in his riches; but let him who glories glory in this, that he understands and knows Me." This lesson explores why knowing God is the foundation of all true faith and how we can pursue that knowledge.',
          },
          {
            title: 'The Attributes of God: Holy, Just, and Loving',
            type: 'text',
            duration: '15 min',
            mediaUrl: null,
            content:
              'God reveals Himself through His attributes. He is holy (Isaiah 6:3 — "Holy, holy, holy is the LORD of hosts"), just (Deuteronomy 32:4 — "He is the Rock, His work is perfect; for all His ways are justice"), and loving (1 John 4:8 — "God is love"). These attributes are not contradictory but perfectly harmonious in His divine nature. His holiness demands justice, and His love provides the way of salvation through Jesus Christ.',
          },
          {
            title: 'The Trinity: One God in Three Persons',
            type: 'pdf',
            duration: '20 min',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            content:
              'The doctrine of the Trinity is central to Christian faith. We worship one God who eternally exists as three distinct Persons — Father, Son, and Holy Spirit. Matthew 28:19 commands us to baptize "in the name of the Father and of the Son and of the Holy Spirit." Each Person is fully God, yet there are not three gods but one God. This mystery is not a contradiction but a profound truth that exceeds human comprehension.',
          },
          {
            title: 'Audio Reflection: Meditating on God\'s Character',
            type: 'audio',
            duration: '12 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Take time to meditate on the character of God through this guided audio reflection. Psalm 145:8-9 declares, "The LORD is gracious and full of compassion, slow to anger and great in mercy. The LORD is good to all, and His tender mercies are over all His works." Allow these truths to sink deep into your heart as you listen and reflect.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: The Nature of God',
          type: 'practice',
          questions: [
            {
              text: 'According to Jeremiah 9:23-24, what should we glory in?',
              options: '["Our wisdom and knowledge", "Our strength and might", "Our wealth and riches", "Understanding and knowing God"]',
              correctAnswer: 'Understanding and knowing God',
              explanation:
                'Jeremiah 9:23-24 clearly states that we should glory in understanding and knowing God, not in our own wisdom, might, or riches.',
              points: 1,
            },
            {
              text: 'Which attribute of God is declared three times in Isaiah 6:3?',
              options: '["Love", "Justice", "Holiness", "Mercy"]',
              correctAnswer: 'Holiness',
              explanation:
                'The seraphim cry "Holy, holy, holy is the LORD of hosts" — the triple repetition emphasizes the supreme holiness of God.',
              points: 1,
            },
            {
              text: 'The doctrine of the Trinity teaches that:',
              options: '["There are three separate gods", "God is one Person who appears in three forms", "One God eternally exists as three distinct Persons", "The Trinity is only mentioned in the New Testament"]',
              correctAnswer: 'One God eternally exists as three distinct Persons',
              explanation:
                'The orthodox doctrine of the Trinity affirms one God in three co-equal, co-eternal Persons — Father, Son, and Holy Spirit.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Reflective Essay: Encountering God',
          description:
            'Write a 500-word reflection on how understanding God\'s attributes (holiness, justice, and love) impacts your personal faith journey. Reference at least two Bible passages discussed in this module and explain how these truths shape your daily walk with God.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'The Gospel Message',
        description: 'Understanding the good news of Jesus Christ — His life, death, and resurrection.',
        order: 1,
        lessons: [
          {
            title: 'The Problem: Sin and Its Consequences',
            type: 'text',
            duration: '18 min',
            mediaUrl: null,
            content:
              'Romans 3:23 declares, "For all have sinned and fall short of the glory of God." Sin is not merely bad behavior — it is a fundamental separation from God. Romans 6:23 warns, "The wages of sin is death." Understanding the severity of sin is essential to appreciating the magnitude of God\'s grace. Sin entered the world through Adam (Romans 5:12), and its effects touch every human heart.',
          },
          {
            title: 'The Solution: Christ\'s Sacrifice on the Cross',
            type: 'video',
            duration: '30 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'John 3:16 reveals the heart of the Gospel: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life." Christ\'s death on the cross was the once-for-all sacrifice for sin (Hebrews 10:10). He who knew no sin became sin for us, that we might become the righteousness of God in Him (2 Corinthians 5:21).',
          },
          {
            title: 'The Resurrection: Victory Over Death',
            type: 'webbook',
            duration: '22 min',
            mediaUrl: 'https://www.gutenberg.org/files/158/158-h/158-h.htm',
            content:
              '1 Corinthians 15:3-4 summarizes the Gospel: "Christ died for our sins according to the Scriptures, and that He was buried, and that He rose again the third day according to the Scriptures." The resurrection is not optional — it is essential. Without it, Paul says our faith is vain (1 Corinthians 15:14). But Christ is risen indeed, proving His victory over sin and death.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: The Gospel Message',
          type: 'practice',
          questions: [
            {
              text: 'According to Romans 3:23, who has sinned?',
              options: '["Only the worst sinners", "All people", "Only non-believers", "Those who reject God"]',
              correctAnswer: 'All people',
              explanation:
                'Romans 3:23 is universal in its scope — "all have sinned and fall short of the glory of God."',
              points: 1,
            },
            {
              text: 'What does Romans 6:23 say is the wages of sin?',
              options: '["Suffering", "Guilt", "Death", "Poverty"]',
              correctAnswer: 'Death',
              explanation:
                'Romans 6:23 states clearly that "the wages of sin is death" — spiritual separation from God.',
              points: 1,
            },
            {
              text: 'According to 1 Corinthians 15:14, if Christ is not risen, our faith is:',
              options: '["Strengthened", "Vain (useless)", "Still valid", "Sufficient"]',
              correctAnswer: 'Vain (useless)',
              explanation:
                'Paul argues that without the resurrection, faith is empty and futile — "your faith is also vain."',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Personal Testimony: My Gospel Story',
          description:
            'Write a 600-word personal testimony describing how the Gospel message has transformed your life. If you are a new believer, reflect on what the Gospel means to you now. Reference Romans 5:8 and explain how "while we were still sinners, Christ died for us" applies to your story.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Living by Faith',
        description: 'Walking in faith daily — trusting God, growing in spiritual maturity, and persevering.',
        order: 2,
        lessons: [
          {
            title: 'What Is Faith? Hebrews 11 Explored',
            type: 'video',
            duration: '28 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Hebrews 11:1 defines faith as "the substance of things hoped for, the evidence of things not seen." This chapter, often called the "Hall of Faith," presents men and women who trusted God against impossible odds — Abraham leaving his homeland, Moses choosing suffering over sin\'s pleasures, and Rahab risking her life to shelter God\'s people. True faith is not blind optimism; it is confident trust in God\'s character and promises.',
          },
          {
            title: 'Growing in Faith: From Milk to Solid Food',
            type: 'text',
            duration: '15 min',
            mediaUrl: null,
            content:
              '1 Corinthians 3:1-2 and Hebrews 5:12-14 contrast spiritual infancy with maturity. New believers need "milk" — basic truths of salvation. But God calls us to grow into "solid food" — deeper understanding and obedient living. Peter exhorts us to "grow in the grace and knowledge of our Lord and Savior Jesus Christ" (2 Peter 3:18). Spiritual growth comes through Scripture, prayer, fellowship, and obedience.',
          },
          {
            title: 'Persevering Through Trials',
            type: 'audio',
            duration: '18 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'James 1:2-4 teaches us to "count it all joy when you fall into various trials, knowing that the testing of your faith produces patience." Trials are not evidence of God\'s absence but His refining work. Romans 5:3-5 shows the chain: suffering produces perseverance, perseverance produces character, and character produces hope — a hope that does not disappoint.',
          },
        ],
        quiz: {
          title: 'Final Exam: Foundations of Christian Faith',
          type: 'final',
          questions: [
            {
              text: 'Hebrews 11:1 defines faith as:',
              options: '["Believing without any evidence", "The substance of things hoped for, the evidence of things not seen", "Complete certainty about the future", "Ignoring doubts and difficulties"]',
              correctAnswer: 'The substance of things hoped for, the evidence of things not seen',
              explanation:
                'Hebrews 11:1 provides the biblical definition of faith as "the substance of things hoped for, the evidence of things not seen."',
              points: 2,
            },
            {
              text: 'According to Romans 5:8, when did Christ die for us?',
              options: '["After we repented", "When we were already good", "While we were still sinners", "After we earned salvation"]',
              correctAnswer: 'While we were still sinners',
              explanation:
                'Romans 5:8 emphasizes God\'s unconditional love: "But God demonstrates His own love toward us, in that while we were still sinners, Christ died for us."',
              points: 2,
            },
            {
              text: 'The Trinity is best described as:',
              options: '["Three gods working together", "One God in three Persons", "God appearing in different forms at different times", "A symbolic representation of God\'s qualities"]',
              correctAnswer: 'One God in three Persons',
              explanation:
                'The orthodox Christian doctrine of the Trinity affirms one divine Being existing eternally in three distinct Persons: Father, Son, and Holy Spirit.',
              points: 2,
            },
            {
              text: 'James 1:2-4 teaches that trials produce:',
              options: '["Despair and hopelessness", "Patience/perseverance", "Immediate blessing", "Avoidance of suffering"]',
              correctAnswer: 'Patience/perseverance',
              explanation:
                'James teaches that "the testing of your faith produces patience" — trials are a tool God uses to build spiritual endurance.',
              points: 2,
            },
            {
              text: 'What does 2 Peter 3:18 command believers to do?',
              options: '["Wait patiently for Christ\'s return", "Grow in grace and knowledge of Jesus", "Avoid all suffering", "Preach to every nation"]',
              correctAnswer: 'Grow in grace and knowledge of Jesus',
              explanation:
                '2 Peter 3:18 exhorts believers to "grow in the grace and knowledge of our Lord and Savior Jesus Christ."',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'Faith Journey Reflection',
          description:
            'Write a 700-word essay reflecting on your faith journey so far. Using Hebrews 11 as a framework, identify one "Hall of Faith" moment in your own life — a time when you had to trust God despite not seeing the outcome. What did you learn about God\'s faithfulness through that experience?',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
  {
    title: 'Biblical Hermeneutics',
    description:
      'Learn the art and science of biblical interpretation. This course equips you with sound principles for understanding Scripture in its historical, literary, and theological context, ensuring faithful and accurate interpretation of God\'s Word.',
    category: 'Leadership',
    level: 'Intermediate',
    duration: '10 weeks',
    instructor: 'Prof. Esther Osei',
    featured: true,
    enrolled: 189,
    rating: 4.9,
    image: '/images/hermeneutics.jpg',
    modules: [
      {
        title: 'Principles of Interpretation',
        description: 'Foundational rules for reading and understanding Scripture accurately.',
        order: 0,
        lessons: [
          {
            title: 'Why Hermeneutics Matters',
            type: 'video',
            duration: '22 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              '2 Timothy 2:15 commands us to "rightly divide the word of truth." Hermeneutics — the science of interpretation — protects us from twisting Scripture to fit our own ideas (2 Peter 3:16). Proper interpretation requires humility, diligence, and dependence on the Holy Spirit, who is the ultimate Teacher of God\'s Word (John 14:26).',
          },
          {
            title: 'The Grammatical-Historical Method',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'The grammatical-historical method seeks to understand the original meaning of the text by studying its grammar, historical context, and cultural setting. We ask: What did the original author intend? What did the original audience understand? This method respects the text as God\'s inspired Word and seeks His intended meaning rather than imposing our own.',
          },
          {
            title: 'Context Is King: Reading Scripture in Context',
            type: 'pdf',
            duration: '18 min',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            content:
              'Every verse must be read in its immediate context (surrounding verses), its book context (the purpose and theme of the whole book), and its canonical context (how it fits within the entire Bible). A text without a context is a pretext for a proof text. We must resist the temptation to isolate verses from their God-given context.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Principles of Interpretation',
          type: 'practice',
          questions: [
            {
              text: '2 Timothy 2:15 instructs believers to:',
              options: '["Preach the Word boldly", "Rightly divide the word of truth", "Memorize Scripture daily", "Translate the Bible into all languages"]',
              correctAnswer: 'Rightly divide the word of truth',
              explanation:
                'Paul commands Timothy to "rightly divide" (accurately handle) the word of truth, emphasizing careful and faithful interpretation.',
              points: 1,
            },
            {
              text: 'The grammatical-historical method primarily seeks to understand:',
              options: '["Our personal application first", "The original meaning of the text", "Only the literary style", "Modern cultural relevance"]',
              correctAnswer: 'The original meaning of the text',
              explanation:
                'The grammatical-historical method prioritizes the author\'s intended meaning for the original audience before applying it to contemporary life.',
              points: 1,
            },
            {
              text: '2 Peter 3:16 warns that untaught and unstable people:',
              options: '["Refuse to read Scripture", "Twist the Scriptures to their own destruction", "Only read the Old Testament", "Take Scripture too literally"]',
              correctAnswer: 'Twist the Scriptures to their own destruction',
              explanation:
                'Peter warns that some twist Paul\'s writings "as they do also the rest of the Scriptures, to their own destruction" — showing the danger of mishandling God\'s Word.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Hermeneutics Practice Exercise',
          description:
            'Select a passage of at least 6 verses from the New Testament. Apply the grammatical-historical method to write a 500-word analysis. Identify the historical context, the literary genre, key grammatical features, and the author\'s intended meaning. How does proper context change or confirm your understanding of this passage?',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Literary Genres in Scripture',
        description: 'Understanding different types of biblical literature and how to interpret each correctly.',
        order: 1,
        lessons: [
          {
            title: 'Narrative: Reading the Stories of Scripture',
            type: 'video',
            duration: '25 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Narrative comprises approximately 40% of the Old Testament. Biblical narrative is not just storytelling — it is theological history. The narrator selects and arranges events to reveal God\'s character and purposes. When reading narrative, we must distinguish between what the text describes (which may include sinful behavior) and what it prescribes (what God commands).',
          },
          {
            title: 'Poetry and Wisdom Literature',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'The Psalms, Proverbs, Job, Ecclesiastes, and Song of Solomon use poetic devices — parallelism, metaphor, hyperbole, and imagery. These features must be interpreted as such. For example, Psalm 51:7 — "Purge me with hyssop, and I shall be clean" — uses ceremonial imagery to express deep repentance, not a literal command about hyssop.',
          },
          {
            title: 'Prophecy and Apocalyptic Literature',
            type: 'webbook',
            duration: '25 min',
            mediaUrl: 'https://www.gutenberg.org/files/158/158-h/158-h.htm',
            content:
              'Prophetic books like Isaiah, Jeremiah, and Revelation require special interpretive care. Prophecy often has both near fulfillment (events in the prophet\'s day) and far fulfillment (events yet to come). Apocalyptic literature (Daniel, Revelation) uses vivid symbolic imagery — beasts, numbers, cosmic events — to convey spiritual truths about God\'s ultimate victory.',
          },
          {
            title: 'Epistles: Letters to Churches and Individuals',
            type: 'audio',
            duration: '15 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'The New Testament epistles follow the Greco-Roman letter format: greeting, thanksgiving, body, and closing. When interpreting epistles, we must identify the occasion (what prompted the letter) and then derive theological principles that transcend the original situation. Paul\'s letters to the Corinthians, for instance, address specific church problems but contain timeless truth for all believers.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Literary Genres',
          type: 'practice',
          questions: [
            {
              text: 'Narrative in Scripture primarily serves as:',
              options: '["Entertainment stories", "Theological history revealing God\'s character", "Moral fables with hidden meanings", "Purely chronological records"]',
              correctAnswer: "Theological history revealing God's character",
              explanation:
                'Biblical narrative is theological history — the narrator selects and arranges events specifically to reveal God\'s character and redemptive purposes.',
              points: 1,
            },
            {
              text: 'When reading Psalm 51:7 ("Purge me with hyssop"), we should understand the hyssop as:',
              options: '["A literal command to use hyssop plants", "Ceremonial imagery expressing deep repentance", "A medical prescription", "An agricultural reference"]',
              correctAnswer: 'Ceremonial imagery expressing deep repentance',
              explanation:
                'David uses ceremonial/ritual imagery (hyssop was used in purification rites) as a poetic metaphor for his desire for spiritual cleansing.',
              points: 1,
            },
            {
              text: 'Prophetic literature often has:',
              options: '["Only future fulfillments", "Only past fulfillments", "Both near and far fulfillments", "No real fulfillments"]',
              correctAnswer: 'Both near and far fulfillments',
              explanation:
                'Biblical prophecy frequently has a dual fulfillment — events in the prophet\'s own day (near) and events yet to come (far).',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Genre Analysis Paper',
          description:
            'Choose one chapter from a wisdom book (Proverbs, Ecclesiastes, or Job) and write a 500-word analysis identifying the literary devices used. How does recognizing the genre (wisdom literature) affect your interpretation? Contrast this with how you might read the same passage if you treated it as narrative or law.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Application and Responsible Interpretation',
        description: 'Moving from interpretation to application — living out the Word faithfully.',
        order: 2,
        lessons: [
          {
            title: 'From Then to Now: Bridging the Cultural Gap',
            type: 'text',
            duration: '18 min',
            mediaUrl: null,
            content:
              'The Bible was written in ancient Near Eastern and Greco-Roman cultures, but its message transcends time. Our task is to discover the theological principle behind each passage and apply it faithfully today. For example, the command to "greet one another with a holy kiss" (Romans 16:16) reflects the cultural expression of Christian love — the principle is warm, genuine fellowship, not necessarily kissing.',
          },
          {
            title: 'The Role of the Holy Spirit in Interpretation',
            type: 'video',
            duration: '20 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'John 16:13 promises that "when He, the Spirit of truth, has come, He will guide you into all truth." The Holy Spirit illuminates Scripture, enabling believers to understand and apply God\'s Word. However, this does not replace careful study — the Spirit works through our diligent effort, not around it. We study with our minds fully engaged while depending on the Spirit\'s illumination.',
          },
          {
            title: 'Common Interpretive Fallacies to Avoid',
            type: 'notes',
            duration: '15 min',
            mediaUrl: null,
            content:
              'Watch for these common errors: (1) Allegorizing — forcing hidden spiritual meanings into plain texts; (2) Proof-texting — isolating verses to support a preconceived idea; (3) Eisegetis — reading meaning INTO the text rather than drawing it OUT; (4) Hyper-literalism — ignoring figurative language and genre; (5) Reader-response — making the text mean whatever the reader wants. Faithful interpretation avoids all of these by respecting the text, context, and authorial intent.',
          },
        ],
        quiz: {
          title: 'Final Exam: Biblical Hermeneutics',
          type: 'final',
          questions: [
            {
              text: 'The grammatical-historical method seeks to determine:',
              options: '["What the text means to me personally", "The author\'s intended meaning for the original audience", "The most creative interpretation possible", "Only the grammatical structure"]',
              correctAnswer: "The author's intended meaning for the original audience",
              explanation:
                'The grammatical-historical method prioritizes authorial intent — what the human author (under divine inspiration) intended to communicate to the original audience.',
              points: 2,
            },
            {
              text: 'When Paul commands believers to "greet one another with a holy kiss" (Romans 16:16), the trans-cultural principle is:',
              options: '["All Christians must literally kiss each other", "Warm, genuine Christian fellowship", "Roman cultural practices should be preserved", "Public displays of affection are required"]',
              correctAnswer: 'Warm, genuine Christian fellowship',
              explanation:
                'The cultural expression (holy kiss) reflects a deeper trans-cultural principle — warm, authentic fellowship among believers.',
              points: 2,
            },
            {
              text: 'John 16:13 teaches that the Holy Spirit will:',
              options: '["Replace the need for Bible study", "Guide believers into all truth", "Only help pastors understand Scripture", "Give new revelations beyond Scripture"]',
              correctAnswer: 'Guide believers into all truth',
              explanation:
                'Jesus promised the Spirit would "guide you into all truth" — He illuminates the Scriptures we study, working through our diligent effort.',
              points: 2,
            },
            {
              text: 'Eisegesis is the error of:',
              options: '["Taking Scripture too literally", "Reading meaning INTO the text rather than drawing it out", "Studying the original languages", "Comparing different translations"]',
              correctAnswer: 'Reading meaning INTO the text rather than drawing it out',
              explanation:
                'Eisegesis is the practice of importing one\'s own ideas into the text, rather than drawing out (exegesis) the text\'s original meaning.',
              points: 2,
            },
            {
              text: 'Biblical prophecy often has dual fulfillment, meaning:',
              options: '["It is always symbolic", "It has both near and far fulfillments", "It is never literally fulfilled", "It only applies to the original audience"]',
              correctAnswer: 'It has both near and far fulfillments',
              explanation:
                'Many prophecies have a near fulfillment in the prophet\'s day and a far fulfillment in the future, reflecting God\'s layered redemptive plan.',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'Full Interpretation Project',
          description:
            'Select a passage of 10-15 verses from any book of the Bible. Write a 1000-word paper that includes: (1) Historical-cultural context, (2) Literary genre and features, (3) Grammatical analysis of key terms, (4) Theological principle(s), and (5) Contemporary application. Show your work step by step, demonstrating proper hermeneutical method.',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
  {
    title: 'Christian Leadership & Ministry',
    description:
      'Discover biblical principles of leadership and ministry. Whether you are called to pastoral ministry, missions, or lay leadership, this course provides practical training grounded in Scripture to equip you for effective service in God\'s kingdom.',
    category: 'Ministry',
    level: 'Intermediate',
    duration: '10 weeks',
    instructor: 'Rev. Joseph Adeyemi',
    featured: true,
    enrolled: 156,
    rating: 4.7,
    image: '/images/leadership.jpg',
    modules: [
      {
        title: 'Biblical Foundations of Leadership',
        description: 'What Scripture teaches about leading God\'s people.',
        order: 0,
        lessons: [
          {
            title: 'Jesus: The Model Servant Leader',
            type: 'video',
            duration: '28 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Jesus redefined leadership. In Mark 10:42-45, He contrasted worldly leadership ("lord it over them") with kingdom leadership: "Whoever of you desires to be first shall be slave of all." He demonstrated this by washing His disciples\' feet (John 13:14-15) and giving His life as a ransom. Christian leadership is servant leadership — leading by sacrifice, humility, and love.',
          },
          {
            title: 'Leadership Qualifications in the Pastoral Epistles',
            type: 'text',
            duration: '22 min',
            mediaUrl: null,
            content:
              '1 Timothy 3:1-7 and Titus 1:5-9 outline qualifications for church leaders: above reproach, faithful in marriage, temperate, sober-minded, hospitable, able to teach, not given to wine or violence, gentle, not quarrelsome, not covetous. Notice — character precedes gifting. God is more concerned with who a leader IS than what a leader DOES. Competence without character is dangerous.',
          },
          {
            title: 'Audio Devotional: Leading Like Joshua',
            type: 'audio',
            duration: '15 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Joshua 1:8-9 gives the key to successful leadership: "This Book of the Law shall not depart from your mouth, but you shall meditate in it day and night... Be strong and of good courage; do not be afraid, nor be dismayed, for the LORD your God is with you wherever you go." Joshua\'s strength came not from military might but from obedience to God\'s Word and the assurance of God\'s presence.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Biblical Foundations of Leadership',
          type: 'practice',
          questions: [
            {
              text: 'According to Mark 10:43-44, whoever desires to be great must be:',
              options: '["The most knowledgeable", "A servant (diakonos) and slave (doulos) of all", "The most popular", "Financially successful"]',
              correctAnswer: 'A servant (diakonos) and slave (doulos) of all',
              explanation:
                'Jesus taught that greatness in His kingdom is measured by servanthood — "whoever desires to become great among you shall be your servant."',
              points: 1,
            },
            {
              text: 'In 1 Timothy 3, the primary qualifications for leadership emphasize:',
              options: '["Spiritual gifts and miracles", "Character over competence", "Academic credentials", "Public speaking ability"]',
              correctAnswer: 'Character over competence',
              explanation:
                'The pastoral epistles list character qualifications before any functional requirements — God prioritizes who a leader IS over what a leader can do.',
              points: 1,
            },
            {
              text: 'Joshua 1:8 teaches that the key to successful leadership is:',
              options: '["Military strategy", "Meditating on and obeying God\'s Word", "Building alliances", "Wealth accumulation"]',
              correctAnswer: "Meditating on and obeying God's Word",
              explanation:
                'God commanded Joshua to meditate on the Book of the Law day and night — obedience to God\'s Word is the foundation of effective leadership.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Leadership Assessment Essay',
          description:
            'Using 1 Timothy 3:1-7 as your framework, write a 600-word self-assessment of your own leadership character. Which qualifications do you see growing in your life? Which areas need further development? Be honest and specific. Include a practical plan for growth in one area of weakness.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Practical Ministry Skills',
        description: 'Developing the hands-on skills needed for effective ministry.',
        order: 1,
        lessons: [
          {
            title: 'Preaching and Teaching the Word',
            type: 'video',
            duration: '35 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              '2 Timothy 4:2 charges us to "Preach the word! Be ready in season and out of season. Convince, rebuke, exhort, with all longsuffering and teaching." Effective preaching begins with faithful exegesis, proceeds to clear organization, and ends with compelling application. The goal is not entertainment but transformation — that hearers would encounter the living God through His Word.',
          },
          {
            title: 'Pastoral Care and Counseling',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'Paul models pastoral care in 1 Thessalonians 2:7-8: "We were gentle among you, just as a nursing mother cherishes her own children. So, affectionately longing for you, we were well pleased to impart to you not only the gospel of God, but also our own lives." Pastoral care involves presence, listening, weeping with those who weep (Romans 12:15), and pointing people to the Good Shepherd.',
          },
          {
            title: 'Leading Small Groups and Discipleship',
            type: 'pdf',
            duration: '18 min',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            content:
              'Jesus\' primary discipleship method was a small group — twelve men He invested in deeply. The Great Commission (Matthew 28:19-20) calls us to make disciples, not merely converts. Effective small groups foster vulnerability, accountability, Scripture engagement, and mutual encouragement (Hebrews 10:24-25). They are the engine room of church growth and spiritual formation.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Practical Ministry Skills',
          type: 'practice',
          questions: [
            {
              text: '2 Timothy 4:2 commands us to:',
              options: '["Entertain the congregation", "Preach the word in season and out of season", "Focus only on positive messages", "Avoid controversial topics"]',
              correctAnswer: 'Preach the word in season and out of season',
              explanation:
                'Paul\'s charge to Timothy is to preach the Word faithfully regardless of whether it is popular or convenient.',
              points: 1,
            },
            {
              text: 'Paul describes his pastoral approach in 1 Thessalonians 2:7-8 as being like:',
              options: '["A strict commander", "A nursing mother cherishing her children", "A distant advisor", "A business manager"]',
              correctAnswer: 'A nursing mother cherishing her children',
              explanation:
                'Paul uses the tender imagery of a nursing mother to describe his gentle, sacrificial care for the Thessalonian believers.',
              points: 1,
            },
            {
              text: 'Jesus\' primary method for making disciples was:',
              options: '["Large public events", "Writing books", "A small group of twelve", "Online courses"]',
              correctAnswer: 'A small group of twelve',
              explanation:
                'Jesus invested deeply in twelve disciples through intimate relationship, teaching, and modeling — the most effective discipleship strategy in history.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Ministry Plan Development',
          description:
            'Design a ministry plan for a specific context (youth, women, men, couples, etc.). Write a 700-word plan that includes: the target group, biblical foundation, vision and goals, program structure, and a 3-month implementation timeline. Reference at least two biblical passages that inform your approach.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Leading Through Challenges',
        description: 'Navigating conflict, burnout, and spiritual warfare in ministry.',
        order: 2,
        lessons: [
          {
            title: 'Conflict Resolution: A Biblical Approach',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'Matthew 18:15-17 provides Jesus\' framework for resolving conflict: go privately first, then with witnesses, then before the church. The goal is always restoration (Galatians 6:1 — "restore such a one in a spirit of gentleness"). Ephesians 4:26 reminds us to be angry but not sin — addressing issues promptly without letting the sun go down on our wrath.',
          },
          {
            title: 'Avoiding Burnout: Rest and Boundaries in Ministry',
            type: 'video',
            duration: '22 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Even Jesus withdrew to rest (Mark 6:31 — "Come aside by yourselves to a deserted place and rest a while"). Elijah experienced burnout after Mount Carmel (1 Kings 19). God\'s response was rest, nourishment, and a gentle whisper. Ministry without margins leads to depletion. Sabbath rest is not laziness — it is obedience and trust that God\'s work does not depend solely on our effort.',
          },
          {
            title: 'Spiritual Warfare for Leaders',
            type: 'audio',
            duration: '18 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Ephesians 6:10-18 describes the full armor of God. Leaders face intensified spiritual opposition because the enemy targets those who advance God\'s kingdom. We are called to stand firm — wearing the belt of truth, breastplate of righteousness, shoes of the gospel of peace, shield of faith, helmet of salvation, and sword of the Spirit (God\'s Word). Our weapon is not carnal but mighty in God for pulling down strongholds (2 Corinthians 10:4).',
          },
        ],
        quiz: {
          title: 'Final Exam: Christian Leadership & Ministry',
          type: 'final',
          questions: [
            {
              text: 'According to Mark 10:45, Jesus came not to be served but to:',
              options: '["Establish an earthly kingdom", "Serve and give His life as a ransom", "Conquer the Roman Empire", "Build a large following"]',
              correctAnswer: 'Serve and give His life as a ransom',
              explanation:
                'Jesus defined His mission as service and sacrifice: "the Son of Man did not come to be served, but to serve, and to give His life a ransom for many."',
              points: 2,
            },
            {
              text: 'Matthew 18:15-17 teaches that conflict resolution should begin with:',
              options: '["Telling others about the offense", "Going privately to the person who offended you", "Bringing the matter before the whole church", "Posting about it publicly"]',
              correctAnswer: 'Going privately to the person who offended you',
              explanation:
                'Jesus teaches a graduated approach that begins with private, one-on-one conversation, preserving dignity and maximizing the chance of reconciliation.',
              points: 2,
            },
            {
              text: 'In 1 Kings 19, God\'s response to Elijah\'s burnout included:',
              options: '["Tough love and criticism", "Rest, nourishment, and a gentle whisper", "A dramatic display of power", "Rejection and replacement"]',
              correctAnswer: 'Rest, nourishment, and a gentle whisper',
              explanation:
                'God responded to Elijah\'s burnout with tender care — food, rest, and then spoke in a gentle whisper, not the dramatic displays of wind, earthquake, or fire.',
              points: 2,
            },
            {
              text: 'The "sword of the Spirit" in Ephesians 6 refers to:',
              options: '["The believer\'s courage", "The Word of God", "Angelic protection", "Prayer"]',
              correctAnswer: 'The Word of God',
              explanation:
                'Ephesians 6:17 identifies the sword of the Spirit specifically as "the word of God" — the only offensive weapon in the armor of God.',
              points: 2,
            },
            {
              text: 'According to Galatians 6:1, restoring a fallen brother should be done in:',
              options: '["A spirit of judgment", "Public confrontation", "A spirit of gentleness", "Strict discipline"]',
              correctAnswer: 'A spirit of gentleness',
              explanation:
                'Paul instructs that those who are spiritual should restore the fallen "in a spirit of gentleness, considering yourself lest you also be tempted."',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'Leadership Challenge Response',
          description:
            'Write an 800-word case study response to the following scenario: A key ministry volunteer has been spreading gossip about the leadership team, causing division. Using Matthew 18:15-17 and Galatians 6:1 as your guide, outline step-by-step how you would address this situation. Include what you would say, when, and to whom.',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
  {
    title: 'Prayer & Spiritual Disciplines',
    description:
      'Deepen your prayer life and cultivate spiritual habits that draw you closer to God. This course explores various forms of prayer, meditation on Scripture, fasting, and other disciplines that have sustained believers throughout church history.',
    category: 'Life Coaching',
    level: 'Beginner',
    duration: '6 weeks',
    instructor: 'Sister Mary Acheampong',
    featured: false,
    enrolled: 198,
    rating: 4.9,
    image: '/images/prayer.jpg',
    modules: [
      {
        title: 'The Heart of Prayer',
        description: 'Understanding what prayer is and why it matters.',
        order: 0,
        lessons: [
          {
            title: 'What Is Prayer? Communion with God',
            type: 'video',
            duration: '24 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Prayer is not a religious ritual — it is a relationship. Jesus modeled this intimately, regularly withdrawing to commune with the Father (Luke 5:16). The Lord\'s Prayer (Matthew 6:9-13) teaches us to approach God as Father, honor His name, seek His kingdom, trust Him for provision, seek forgiveness, and ask for protection. Prayer is both a privilege and a necessity for the Christian life.',
          },
          {
            title: 'The Lord\'s Prayer: A Model for All Prayer',
            type: 'text',
            duration: '18 min',
            mediaUrl: null,
            content:
              'Matthew 6:9-13 provides the framework: "Our Father in heaven" — intimacy with reverence; "Hallowed be Your name" — worship; "Your kingdom come" — alignment with God\'s purposes; "Give us this day our daily bread" — dependence; "Forgive us our debts" — confession; "Lead us not into temptation" — protection. Each phrase reveals a dimension of our relationship with God.',
          },
          {
            title: 'Audio Guide: Practicing the Lord\'s Prayer',
            type: 'audio',
            duration: '20 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'This guided audio walk-through helps you pray through each phrase of the Lord\'s Prayer with extended meditation. Pause after each phrase and let it become your own heart\'s cry. Let "Hallowed be Your name" become your worship. Let "Your will be done" become your surrender. Let "Give us this day" become your trust.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: The Heart of Prayer',
          type: 'practice',
          questions: [
            {
              text: 'Luke 5:16 tells us that Jesus often:',
              options: '["Preached to large crowds", "Withdrew to lonely places and prayed", "Performed miracles in the temple", "Debated the religious leaders"]',
              correctAnswer: 'Withdrew to lonely places and prayed',
              explanation:
                'Luke 5:16 reveals Jesus\' rhythm of withdrawing to desolate places for prayer — communion with the Father was the priority that fueled His ministry.',
              points: 1,
            },
            {
              text: 'The Lord\'s Prayer begins with "Our Father" which emphasizes:',
              options: '["Formal religious language", "Intimate relationship with God", "God\'s distance from us", "Strict hierarchy"]',
              correctAnswer: 'Intimate relationship with God',
              explanation:
                '"Our Father" (Abba) reflects the intimate, familial relationship believers have with God — a revolutionary concept in Jesus\' day.',
              points: 1,
            },
            {
              text: '"Hallowed be Your name" in the Lord\'s Prayer means:',
              options: '["God\'s name should be hidden", "May Your name be treated as holy and honored", "We should not speak God\'s name", "God\'s name is already perfectly hallowed"]',
              correctAnswer: 'May Your name be treated as holy and honored',
              explanation:
                'This is a petition — asking that God\'s name be revered, honored, and set apart as holy in all the earth, starting with our own lives.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Prayer Journal Reflection',
          description:
            'Keep a prayer journal for one week using the Lord\'s Prayer as your daily framework. Write a 500-word reflection on what you discovered about your prayer life. Which phrases of the Lord\'s Prayer were most meaningful? Where did you struggle? How did this structured approach change your experience of prayer?',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Disciplines of the Faith',
        description: 'Exploring fasting, Scripture meditation, solitude, and other spiritual practices.',
        order: 1,
        lessons: [
          {
            title: 'Scripture Meditation: Chewing on God\'s Word',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'Psalm 1:2 describes the blessed person whose "delight is in the law of the LORD, and in His law he meditates day and night." Biblical meditation is not emptying the mind but filling it with God\'s truth. The Hebrew word "hagah" means to mutter, murmur, or ponder — like a cow chewing cud, turning truth over and over until it nourishes the soul. Joshua 1:8 promises success to those who meditate on God\'s Word continually.',
          },
          {
            title: 'Fasting: Hunger That Draws Us to God',
            type: 'video',
            duration: '25 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Jesus assumed His followers would fast (Matthew 6:16 — "When you fast..."). Fasting is voluntarily abstaining from food (or other things) for a spiritual purpose. It intensifies prayer, demonstrates dependence on God, and aligns our desires with His. Isaiah 58 describes the fast God chooses — not mere self-denial but loosing bonds of wickedness, feeding the hungry, and clothing the naked.',
          },
          {
            title: 'Solitude and Silence: Meeting God in the Quiet',
            type: 'audio',
            duration: '15 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              '1 Kings 19:12 reveals that God spoke to Elijah not in the wind, earthquake, or fire, but in "a still small voice." Solitude and silence remove the noise that drowns out God\'s whisper. Jesus practiced solitude regularly (Mark 1:35 — "in the morning, having risen a long while before daylight, He went out and departed to a solitary place; and there He prayed"). In our noisy world, silence is a radical act of faith.',
          },
          {
            title: 'Journaling: Writing Your Spiritual Journey',
            type: 'notes',
            duration: '12 min',
            mediaUrl: null,
            content:
              'The Psalms are essentially David\'s prayer journal — raw, honest, and deeply personal. Journaling helps us process our thoughts, track spiritual growth, remember God\'s faithfulness, and articulate our prayers more thoughtfully. Habakkuk 2:2 says, "Write the vision and make it plain." Consider journaling your prayers, insights from Scripture, and moments of God\'s faithfulness.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Disciplines of the Faith',
          type: 'practice',
          questions: [
            {
              text: 'The Hebrew word "hagah" (meditate) literally means:',
              options: '["To empty the mind", "To mutter, murmur, or ponder", "To sit in silence", "To chant repeatedly"]',
              correctAnswer: 'To mutter, murmur, or ponder',
              explanation:
                'Hagah means to mutter or murmur — it carries the idea of repeatedly turning truth over in one\'s mind and mouth, like chewing food thoroughly.',
              points: 1,
            },
            {
              text: 'In Isaiah 58, the fast God chooses involves:',
              options: '["Only self-denial from food", "Loosing bonds of wickedness and caring for the needy", "Long periods of isolation", "Strict religious observance"]',
              correctAnswer: 'Loosing bonds of wickedness and caring for the needy',
              explanation:
                'God declares that true fasting involves justice and mercy — "loose the bonds of wickedness... share your bread with the hungry."',
              points: 1,
            },
            {
              text: 'In 1 Kings 19, God spoke to Elijah through:',
              options: '["A powerful wind", "An earthquake", "A still small voice", "A consuming fire"]',
              correctAnswer: 'A still small voice',
              explanation:
                'After the dramatic displays of wind, earthquake, and fire, God spoke in "a still small voice" — showing that His presence is often found in quietness.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Spiritual Disciplines Practice Report',
          description:
            'Choose one spiritual discipline (fasting, Scripture meditation, solitude, or journaling) that is new or challenging for you. Practice it for one week and write a 600-word report describing your experience. What did you learn about God? About yourself? What obstacles did you face, and how did you overcome them?',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Persevering in Prayer',
        description: 'Developing a consistent, enduring prayer life through every season.',
        order: 2,
        lessons: [
          {
            title: 'Praying Without Ceasing: 1 Thessalonians 5:17',
            type: 'text',
            duration: '15 min',
            mediaUrl: null,
            content:
              '"Pray without ceasing" does not mean 24/7 verbal prayer but an ongoing attitude of dependence on God. It is the orientation of the heart toward God throughout every moment — like breathing. Nehemiah prayed a "flash prayer" (Nehemiah 2:4) before answering the king. Anna "did not depart from the temple, but served God with fastings and prayers night and day" (Luke 2:37). A life of prayer is a life of abiding in Christ (John 15:5).',
          },
          {
            title: 'When God Seems Silent: Persevering in Prayer',
            type: 'video',
            duration: '22 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Jesus told a parable about persistent prayer — the widow who kept coming to the unjust judge (Luke 18:1-8). The lesson: "Shall God not avenge His own elect who cry out day and night to Him?" Even when answers seem delayed, God is not deaf. Daniel prayed 21 days before the answer came (Daniel 10:12-13). God\'s silence is not God\'s absence. Perseverance in prayer refines our faith and aligns our will with God\'s.',
          },
          {
            title: 'Praying in the Spirit: The Power of the Holy Spirit in Prayer',
            type: 'audio',
            duration: '18 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Romans 8:26-27 reveals that "the Spirit also helps in our weaknesses. For we do not know what we should pray for as we ought, but the Spirit Himself makes intercession for us." When words fail, the Holy Spirit prays through us. Jude 20 exhorts us to "pray in the Holy Spirit." Prayer is not a solo endeavor — the Spirit within us and Christ above us both intercede (Romans 8:34). We pray in partnership with the Trinity.',
          },
        ],
        quiz: {
          title: 'Final Exam: Prayer & Spiritual Disciplines',
          type: 'final',
          questions: [
            {
              text: '"Pray without ceasing" (1 Thessalonians 5:17) means:',
              options: '["Praying 24 hours a day verbally", "An ongoing attitude of dependence on God", "Attending church services constantly", "Only praying at mealtimes"]',
              correctAnswer: 'An ongoing attitude of dependence on God',
              explanation:
                'Unceasing prayer is a continuous heart-posture of dependence on and communion with God, not non-stop verbal prayer.',
              points: 2,
            },
            {
              text: 'In Luke 18:1-8, Jesus told the parable of the persistent widow to teach:',
              options: '["That God is like an unjust judge", "The importance of persistent prayer and not giving up", "That women are better at praying", "That legal systems are corrupt"]',
              correctAnswer: 'The importance of persistent prayer and not giving up',
              explanation:
                'Jesus told this parable specifically "that men always ought to pray and not lose heart" — persistence in prayer demonstrates faith.',
              points: 2,
            },
            {
              text: 'Romans 8:26 teaches that when we don\'t know how to pray:',
              options: '["We should stop praying", "The Holy Spirit intercedes for us", "We must figure it out alone", "Our prayers are worthless"]',
              correctAnswer: 'The Holy Spirit intercedes for us',
              explanation:
                'The Spirit helps our weakness and intercedes for us "with groanings which cannot be uttered" — God provides His own Spirit to aid our prayer.',
              points: 2,
            },
            {
              text: 'Psalm 1:2 describes the blessed person as one who:',
              options: '["Gives large offerings", "Meditates on God\'s law day and night", "Attends every church service", "Never sins"]',
              correctAnswer: "Meditates on God's law day and night",
              explanation:
                'The blessed person\'s delight is in God\'s law, and they meditate on it continually — constant engagement with Scripture is the mark of true blessedness.',
              points: 2,
            },
            {
              text: 'According to Mark 1:35, Jesus prayed:',
              options: '["Only on the Sabbath", "Before important decisions only", "Early in the morning in a solitary place", "Only with His disciples"]',
              correctAnswer: 'Early in the morning in a solitary place',
              explanation:
                'Jesus rose "a long while before daylight" to pray in solitude — demonstrating that prayer was His highest priority, even above ministry.',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'Comprehensive Prayer Life Plan',
          description:
            'Design a personal prayer and spiritual disciplines plan for the next 3 months. Write an 800-word plan that includes daily, weekly, and monthly practices. Incorporate at least four different spiritual disciplines. Explain the biblical basis for each practice and set specific, measurable goals. How will you build accountability for following through?',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
  {
    title: 'Apologetics: Defending the Faith',
    description:
      'Be prepared to give an answer for the hope within you (1 Peter 3:15). This course trains you to articulate and defend the Christian faith with clarity, gentleness, and respect, addressing the toughest questions and objections from skeptics.',
    category: 'Ministry',
    level: 'Advanced',
    duration: '12 weeks',
    instructor: 'Dr. Kwame Asante',
    featured: true,
    enrolled: 142,
    rating: 4.8,
    image: '/images/apologetics.jpg',
    modules: [
      {
        title: 'The Case for God\'s Existence',
        description: 'Philosophical and scientific arguments for the existence of God.',
        order: 0,
        lessons: [
          {
            title: 'The Cosmological Argument: A First Cause',
            type: 'video',
            duration: '30 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Genesis 1:1 declares, "In the beginning God created the heavens and the earth." The cosmological argument reasons: Everything that begins to exist has a cause; the universe began to exist; therefore, the universe has a cause. This Cause must be timeless, spaceless, immaterial, and enormously powerful — consistent with the God of Scripture. Psalm 19:1 affirms: "The heavens declare the glory of God."',
          },
          {
            title: 'The Moral Argument: Objective Morality Points to God',
            type: 'text',
            duration: '22 min',
            mediaUrl: null,
            content:
              'Romans 2:14-15 teaches that God\'s moral law is written on every human heart. If objective moral values exist (and they do — torturing children for fun is objectively wrong regardless of culture), then a Moral Lawgiver must exist. Without God, morality is merely subjective preference. But our deep moral intuitions reflect a transcendent standard that points to a holy, just God.',
          },
          {
            title: 'The Fine-Tuning of the Universe',
            type: 'pdf',
            duration: '20 min',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            content:
              'The physical constants of the universe — the gravitational constant, electromagnetic force, cosmological constant — are extraordinarily fine-tuned for life. Change any by even a fraction, and life becomes impossible. This precision screams design. Psalm 104:24 declares, "O LORD, how manifold are Your works! In wisdom You have made them all." The fine-tuning argument powerfully supports an intelligent Designer.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: The Case for God\'s Existence',
          type: 'practice',
          questions: [
            {
              text: 'The cosmological argument concludes that the universe must have a cause because:',
              options: '["Scientists say so", "Everything that begins to exist has a cause", "The Bible commands belief", "It feels right intuitively"]',
              correctAnswer: 'Everything that begins to exist has a cause',
              explanation:
                'The cosmological argument follows logically: everything that begins to exist has a cause; the universe began to exist; therefore, the universe has a cause.',
              points: 1,
            },
            {
              text: 'The moral argument for God\'s existence is based on:',
              options: '["Religious tradition", "The existence of objective moral values requiring a Moral Lawgiver", "Fear of punishment", "Cultural consensus"]',
              correctAnswer: 'The existence of objective moral values requiring a Moral Lawgiver',
              explanation:
                'If objective moral values exist, they require a transcendent foundation — a Moral Lawgiver — which is what the moral argument establishes.',
              points: 1,
            },
            {
              text: 'Psalm 19:1 declares that the heavens:',
              options: '["Are empty and vast", "Declare the glory of God", "Are merely scientific phenomena", "Have no theological significance"]',
              correctAnswer: 'Declare the glory of God',
              explanation:
                'David proclaims that creation itself is a revelation of God\'s glory — "The heavens declare the glory of God; the firmament shows His handiwork."',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Apologetics Argument Paper',
          description:
            'Write a 700-word paper presenting one argument for God\'s existence (cosmological, moral, or teleological). Explain the argument logically, address the strongest objection, and provide your response. Reference both biblical and philosophical sources.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'The Reliability of Scripture',
        description: 'Can we trust the Bible? Examining the evidence for its accuracy and divine inspiration.',
        order: 1,
        lessons: [
          {
            title: 'Manuscript Evidence: The Bible\'s Transmission',
            type: 'video',
            duration: '28 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'With over 5,800 Greek manuscripts, 10,000 Latin manuscripts, and millions of quotations from early church fathers, the New Testament is the best-attested document of antiquity by an overwhelming margin. The next closest is Homer\'s Iliad with 643 manuscripts. Jesus Himself affirmed Scripture\'s authority: "Scripture cannot be broken" (John 10:35).',
          },
          {
            title: 'Archaeology and the Bible',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'Archaeological discoveries have repeatedly confirmed biblical accounts: the Hittite Empire (once thought mythical), the Pool of Bethesda (John 5:2), Pilate\'s existence (the Pilate Stone, 1961), and the Dead Sea Scrolls (confirming Isaiah\'s text is virtually identical to our modern Bible). While archaeology does not prove faith, it consistently supports the Bible\'s historical reliability.',
          },
          {
            title: 'Fulfilled Prophecy: The Fingerprints of God',
            type: 'webbook',
            duration: '25 min',
            mediaUrl: 'https://www.gutenberg.org/files/158/158-h/158-h.htm',
            content:
              'Isaiah 46:9-10 declares God as the One "declaring the end from the beginning." Fulfilled prophecy is a unique mark of divine authorship. Micah 5:2 predicted Christ\'s birthplace (Bethlehem) 700 years before His birth. Isaiah 53 described His suffering and death in astonishing detail. Psalm 22 depicted crucifixion before it was invented as a method of execution. These fulfillments defy coincidence.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: The Reliability of Scripture',
          type: 'practice',
          questions: [
            {
              text: 'How many Greek manuscripts of the New Testament exist?',
              options: '["About 50", "About 200", "Over 5,800", "Exactly 1,000"]',
              correctAnswer: 'Over 5,800',
              explanation:
                'With over 5,800 Greek manuscripts, the New Testament far surpasses any other ancient document in manuscript evidence.',
              points: 1,
            },
            {
              text: 'Micah 5:2 predicted that the Messiah would be born in:',
              options: '["Jerusalem", "Nazareth", "Bethlehem", "Egypt"]',
              correctAnswer: 'Bethlehem',
              explanation:
                'Micah prophesied 700 years before Christ that the ruler of Israel would come from Bethlehem — fulfilled precisely in Jesus\' birth.',
              points: 1,
            },
            {
              text: 'Jesus affirmed the authority of Scripture by saying:',
              options: '["It is a good book", "Scripture cannot be broken", "Some parts are more important than others", "It needs updating"]',
              correctAnswer: 'Scripture cannot be broken',
              explanation:
                'In John 10:35, Jesus declared "Scripture cannot be broken" — affirming its absolute authority and unbreakable truth.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Defending Scripture Essay',
          description:
            'A skeptical friend says, "The Bible has been translated so many times, we can\'t know what it originally said." Write a 600-word response explaining why this common objection is based on a misunderstanding. Use specific evidence from manuscript studies and explain how modern translations work.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Answering Tough Questions',
        description: 'Responding to the most common objections to Christianity.',
        order: 2,
        lessons: [
          {
            title: 'The Problem of Evil and Suffering',
            type: 'video',
            duration: '32 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'The problem of evil is the most common objection to Christianity. But the Christian worldview uniquely accounts for both evil\'s reality and its ultimate defeat. God created a good world; evil entered through human free will (Genesis 3); God entered into our suffering in Christ (Isaiah 53:4 — "surely He has borne our griefs"); and God will ultimately destroy evil (Revelation 21:4 — "God will wipe away every tear"). Christianity does not explain away suffering — it provides a suffering Savior who overcomes it.',
          },
          {
            title: 'The Exclusivity of Christ: Is Jesus the Only Way?',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'Jesus claimed exclusivity: "I am the way, the truth, and the life. No one comes to the Father except through Me" (John 14:6). This is not arrogance but grace — God provided a way when we could not save ourselves. Acts 4:12 confirms: "There is no other name under heaven given among men by which we must be saved." The exclusivity of Christ flows from the uniqueness of His person and work — only the sinless Son of God could atone for sin.',
          },
          {
            title: 'Living as an Apologist: 1 Peter 3:15 in Practice',
            type: 'audio',
            duration: '18 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              '1 Peter 3:15 commands us to "sanctify the Lord God in your hearts, and always be ready to give a defense to everyone who asks you a reason for the hope that is in you, with meekness and fear." The word "defense" (apologia) means a reasoned argument. But notice the manner — "with meekness and fear." We defend the truth with gentleness and reverence, not arrogance or hostility. Our lives must match our arguments.',
          },
        ],
        quiz: {
          title: 'Final Exam: Apologetics',
          type: 'final',
          questions: [
            {
              text: '1 Peter 3:15 instructs believers to defend their faith with:',
              options: '["Aggression and force", "Meekness and fear (gentleness and reverence)", "Sophisticated philosophical jargon", "Avoidance of difficult questions"]',
              correctAnswer: 'Meekness and fear (gentleness and reverence)',
              explanation:
                'Peter specifies that our defense of the faith must be characterized by gentleness and reverence — the manner of our apologetics matters as much as the content.',
              points: 2,
            },
            {
              text: 'The Christian response to the problem of evil includes:',
              options: '["Denying evil exists", "God entered our suffering in Christ and will ultimately defeat evil", "Evil is just an illusion", "God cannot do anything about evil"]',
              correctAnswer: 'God entered our suffering in Christ and will ultimately defeat evil',
              explanation:
                'Christianity uniquely addresses evil by affirming its reality, God\'s participation in our suffering through Christ, and evil\'s ultimate defeat in the new creation.',
              points: 2,
            },
            {
              text: 'John 14:6 records Jesus saying:',
              options: '["All paths lead to God", "I am the way, the truth, and the life", "Believe whatever works for you", "There are many ways to the Father"]',
              correctAnswer: 'I am the way, the truth, and the life',
              explanation:
                'Jesus made an exclusive claim: "I am the way, the truth, and the life. No one comes to the Father except through Me."',
              points: 2,
            },
            {
              text: 'The number of New Testament Greek manuscripts is approximately:',
              options: '["Fewer than 100", "About 500", "Over 5,800", "Over 50,000"]',
              correctAnswer: 'Over 5,800',
              explanation:
                'With over 5,800 Greek manuscripts (plus thousands in other languages), the NT has vastly more manuscript evidence than any other ancient text.',
              points: 2,
            },
            {
              text: 'Fulfilled prophecy is significant because:',
              options: '["It proves God is lucky", "It demonstrates divine foreknowledge beyond human possibility", "It is merely coincidental", "Only minor prophecies were fulfilled"]',
              correctAnswer: 'It demonstrates divine foreknowledge beyond human possibility',
              explanation:
                'Specific, detailed prophecies fulfilled centuries later (like Micah 5:2, Isaiah 53, Psalm 22) demonstrate supernatural foreknowledge that defies coincidence.',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'Apologetics Dialogue',
          description:
            'Write an 800-word dialogue between a Christian and a skeptic discussing the problem of evil. The skeptic should raise genuine, thoughtful objections. The Christian should respond with both intellectual arguments and pastoral sensitivity, demonstrating the "meekness and fear" of 1 Peter 3:15. Include at least three Scripture references.',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
  {
    title: 'New Testament Survey',
    description:
      'Journey through the New Testament from Matthew to Revelation. Understand the historical context, key themes, and theological message of each book, and discover how the entire New Testament points to Jesus Christ as Lord and Savior.',
    category: 'Leadership',
    level: 'Beginner',
    duration: '10 weeks',
    instructor: 'Dr. Samuel Mensah',
    featured: false,
    enrolled: 211,
    rating: 4.7,
    image: '/images/new-testament.jpg',
    modules: [
      {
        title: 'The Gospels: Four Portraits of Jesus',
        description: 'Understanding the four Gospel accounts and their unique perspectives on Christ.',
        order: 0,
        lessons: [
          {
            title: 'Matthew: Jesus the King',
            type: 'video',
            duration: '28 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Matthew presents Jesus as the promised Messianic King. He quotes the Old Testament over 60 times, showing Jesus fulfills prophecy. The Sermon on the Mount (Matthew 5-7) reveals the ethics of the Kingdom. The Great Commission (28:19-20) launches the Kingdom\'s expansion. Matthew\'s genealogy traces Jesus back to Abraham, proving His rightful place as Israel\'s Messiah.',
          },
          {
            title: 'Mark: Jesus the Servant',
            type: 'text',
            duration: '18 min',
            mediaUrl: null,
            content:
              'Mark\'s Gospel is fast-paced — "immediately" appears over 40 times. He presents Jesus as the suffering Servant prophesied in Isaiah 53. Mark 10:45 is the key verse: "The Son of Man did not come to be served, but to serve, and to give His life a ransom for many." This Gospel emphasizes action over teaching, showing Jesus constantly moving, serving, healing, and ultimately giving His life.',
          },
          {
            title: 'Luke: Jesus the Savior of All People',
            type: 'audio',
            duration: '22 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Luke, a physician and careful historian (Luke 1:1-4), presents Jesus as the Savior for all people — Jews and Gentiles, men and women, rich and poor. He alone records the parables of the Good Samaritan, the Prodigal Son, and the Pharisee and Tax Collector. Luke emphasizes the Holy Spirit, prayer, and joy. His genealogy traces Jesus back to Adam, showing Christ as Savior of all humanity.',
          },
          {
            title: 'John: Jesus the Son of God',
            type: 'pdf',
            duration: '25 min',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            content:
              'John\'s purpose statement is clear: "These are written that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in His name" (John 20:31). John uses seven "I AM" statements (bread of life, light of the world, door, good shepherd, resurrection and life, way/truth/life, true vine) revealing Jesus\' divine identity. John 1:1 declares His eternal deity: "In the beginning was the Word, and the Word was with God, and the Word was God."',
          },
        ],
        quiz: {
          title: 'Practice Quiz: The Gospels',
          type: 'practice',
          questions: [
            {
              text: 'Which Gospel presents Jesus as the Messianic King with the most Old Testament quotations?',
              options: '["Mark", "Luke", "Matthew", "John"]',
              correctAnswer: 'Matthew',
              explanation:
                'Matthew quotes the Old Testament over 60 times to demonstrate that Jesus is the promised Messiah and King of Israel.',
              points: 1,
            },
            {
              text: 'Mark 10:45 is the key verse identifying Jesus as:',
              options: '["The coming King", "The suffering Servant who gives His life as a ransom", "The great Teacher", "The miracle worker"]',
              correctAnswer: 'The suffering Servant who gives His life as a ransom',
              explanation:
                'Mark 10:45 — "the Son of Man did not come to be served, but to serve, and to give His life a ransom for many" — summarizes Mark\'s portrait of Jesus as Servant.',
              points: 1,
            },
            {
              text: 'John\'s stated purpose for writing his Gospel is found in:',
              options: '["John 1:1", "John 3:16", "John 20:31", "John 17"]',
              correctAnswer: 'John 20:31',
              explanation:
                'John 20:31 explicitly states the evangelistic purpose: "these are written that you may believe that Jesus is the Christ, the Son of God."',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Gospel Portrait Comparison',
          description:
            'Compare how two Gospels present the same event (e.g., the feeding of the 5,000 or the resurrection). Write a 600-word analysis highlighting the unique emphasis each writer brings. How do the differing perspectives complement rather than contradict each other?',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Acts and the Pauline Epistles',
        description: 'The birth of the Church and Paul\'s theological letters.',
        order: 1,
        lessons: [
          {
            title: 'Acts: The Church Empowered by the Spirit',
            type: 'video',
            duration: '26 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Acts is the sequel to Luke, recording the birth and growth of the early Church. Jesus promised the Holy Spirit (Acts 1:8) — "You shall receive power when the Holy Spirit has come upon you; and you shall be witnesses to Me." From Pentecost (Acts 2) to Paul\'s imprisonment in Rome (Acts 28), the gospel advances by the Spirit\'s power through ordinary believers.',
          },
          {
            title: 'Romans: The Gospel of Grace',
            type: 'text',
            duration: '25 min',
            mediaUrl: null,
            content:
              'Romans is Paul\'s magnum opus — the most systematic presentation of the Gospel. Key themes: All have sinned (1-3), justification by faith alone (3-5 — "the just shall live by faith," Romans 1:17), sanctification through the Spirit (6-8), God\'s sovereignty over Israel (9-11), and practical Christian living (12-16). Romans 8:38-39 promises that nothing can separate us from God\'s love in Christ.',
          },
          {
            title: 'The Corinthian Letters: A Church in Crisis',
            type: 'webbook',
            duration: '20 min',
            mediaUrl: 'https://www.gutenberg.org/files/158/158-h/158-h.htm',
            content:
              'Paul\'s letters to Corinth address real problems: division (1 Corinthians 1), sexual immorality (1 Corinthians 5-6), lawsuits among believers (1 Corinthians 6), chaos in worship (1 Corinthians 11-14), and misunderstanding of the resurrection (1 Corinthians 15). Yet amid correction, we find 1 Corinthians 13 — the greatest chapter on love — and 2 Corinthians 12:9 — "My grace is sufficient for you."',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Acts and Pauline Epistles',
          type: 'practice',
          questions: [
            {
              text: 'Acts 1:8 promises that believers will receive power when:',
              options: '["They study hard enough", "The Holy Spirit comes upon them", "They earn it through good works", "They attend church regularly"]',
              correctAnswer: 'The Holy Spirit comes upon them',
              explanation:
                'Jesus promised that power would come specifically through the Holy Spirit — the source of the Church\'s witness and effectiveness.',
              points: 1,
            },
            {
              text: 'The key verse of Romans regarding justification is:',
              options: '["Romans 8:28", "Romans 1:17 — the just shall live by faith", "Romans 12:1", "Romans 3:23"]',
              correctAnswer: 'Romans 1:17 — the just shall live by faith',
              explanation:
                'Romans 1:17 — "the just shall live by faith" — is the thesis statement of the entire epistle, emphasizing justification by faith alone.',
              points: 1,
            },
            {
              text: '1 Corinthians 13 is best known as:',
              options: '["The resurrection chapter", "The love chapter", "The faith chapter", "The judgment chapter"]',
              correctAnswer: 'The love chapter',
              explanation:
                '1 Corinthians 13 is universally known as the "Love Chapter" — Paul\'s profound description of agape love.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Pauline Theology Essay',
          description:
            'Write a 700-word essay on Paul\'s teaching on justification by faith in Romans 3-5. Explain what justification means, how it is received, and why it matters. Contrast Paul\'s teaching with the idea that salvation can be earned through good works.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'General Epistles and Revelation',
        description: 'Hebrews through Revelation — faith, hope, and the ultimate victory of God.',
        order: 2,
        lessons: [
          {
            title: 'Hebrews: The Superiority of Christ',
            type: 'text',
            duration: '22 min',
            mediaUrl: null,
            content:
              'Hebrews presents Christ as superior to angels (1-2), Moses (3), the priesthood (4-7), and the old covenant sacrifices (8-10). The key theme: Jesus is the final, complete, and perfect revelation of God and redemption. Hebrews 12:1-2 calls us to "run with endurance the race that is set before us, looking unto Jesus, the author and finisher of our faith." He is both the pioneer and perfecter.',
          },
          {
            title: 'James and 1 Peter: Faith That Works and Hope That Endures',
            type: 'video',
            duration: '24 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'James emphasizes that genuine faith produces works: "faith by itself, if it does not have works, is dead" (James 2:17). This is not salvation by works but the evidence of salvation — real faith always bears fruit. 1 Peter addresses suffering believers, calling them to hope: "Blessed be the God and Father of our Lord Jesus Christ, who according to His abundant mercy has begotten us again to a living hope" (1 Peter 1:3).',
          },
          {
            title: 'Revelation: The Triumph of the Lamb',
            type: 'audio',
            duration: '25 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Revelation unveils the ultimate victory of God over evil. The central figure is "the Lamb who was slain" (Revelation 5:12) — Jesus Christ, whose sacrifice is the key to history. The book reveals the final judgment, the defeat of Satan, and the new heaven and new earth: "And God will wipe away every tear from their eyes; there shall be no more death, nor sorrow, nor crying. There shall be no more pain, for the former things have passed away" (Revelation 21:4).',
          },
        ],
        quiz: {
          title: 'Final Exam: New Testament Survey',
          type: 'final',
          questions: [
            {
              text: 'The Gospel of Matthew primarily presents Jesus as:',
              options: '["The suffering Servant", "The Son of God", "The Messianic King", "The Savior of all people"]',
              correctAnswer: 'The Messianic King',
              explanation:
                'Matthew emphasizes Jesus as the promised Messiah and King, tracing His royal lineage and fulfilling Old Testament prophecies.',
              points: 2,
            },
            {
              text: 'Hebrews presents Christ as superior to:',
              options: '["Only the angels", "Moses and the priesthood only", "Angels, Moses, the priesthood, and the old covenant sacrifices", "Nothing — Hebrews emphasizes equality"]',
              correctAnswer: 'Angels, Moses, the priesthood, and the old covenant sacrifices',
              explanation:
                'Hebrews systematically demonstrates Christ\'s superiority over every element of the old covenant — angels, Moses, the priesthood, and the sacrificial system.',
              points: 2,
            },
            {
              text: 'James 2:17 teaches that faith without works is:',
              options: '["Incomplete but still valid", "Dead", "Sufficient for salvation", "Better than works alone"]',
              correctAnswer: 'Dead',
              explanation:
                'James states plainly: "faith by itself, if it does not have works, is dead" — genuine saving faith necessarily produces fruit.',
              points: 2,
            },
            {
              text: 'Revelation 21:4 promises that in the new creation:',
              options: '["Sin will still exist but be manageable", "God will wipe away every tear and there will be no more death", "Only some people will be comforted", "The old earth will simply be repaired"]',
              correctAnswer: 'God will wipe away every tear and there will be no more death',
              explanation:
                'Revelation 21:4 describes the complete removal of suffering: no more death, sorrow, crying, or pain — God makes all things new.',
              points: 2,
            },
            {
              text: 'The central figure of the book of Revelation is:',
              options: '["The dragon", "The beast", "The Lamb who was slain", "The angel Michael"]',
              correctAnswer: 'The Lamb who was slain',
              explanation:
                'Revelation\'s central figure is "the Lamb who was slain" (Jesus Christ) — His sacrifice is the key that unlocks all of history.',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'New Testament Theological Synthesis',
          description:
            'Write a 900-word essay tracing the theme of "God\'s redemptive plan" from the Gospels through Revelation. How does the New Testament present one unified story of God rescuing humanity? Include specific references from at least five different New Testament books.',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
  {
    title: 'Old Testament Survey',
    description:
      'Explore the rich tapestry of the Old Testament — from Creation to the Prophets. Understand how every book points forward to Christ and discover the unchanging faithfulness of God throughout Israel\'s history.',
    category: 'Leadership',
    level: 'Beginner',
    duration: '12 weeks',
    instructor: 'Prof. Esther Osei',
    featured: false,
    enrolled: 178,
    rating: 4.6,
    image: '/images/old-testament.jpg',
    modules: [
      {
        title: 'The Law: Genesis through Deuteronomy',
        description: 'The foundational books — creation, covenant, and the giving of the Law.',
        order: 0,
        lessons: [
          {
            title: 'Genesis: Beginnings and the Promise',
            type: 'video',
            duration: '30 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Genesis means "beginnings" — the beginning of the world, humanity, sin, and God\'s redemptive promise. After the Fall (Genesis 3), God immediately promises a Redeemer (Genesis 3:15 — the "protoevangelium"). He calls Abraham with a covenant promise: "In you all the families of the earth shall be blessed" (Genesis 12:3). This promise, fulfilled in Christ (Galatians 3:16), drives the entire biblical narrative.',
          },
          {
            title: 'Exodus: Redemption and Covenant',
            type: 'text',
            duration: '22 min',
            mediaUrl: null,
            content:
              'Exodus is the story of redemption — God delivering His people from slavery. The Passover (Exodus 12) prefigures Christ, "our Passover" (1 Corinthians 5:7). At Sinai, God gives the Law and establishes His covenant: "You shall be to Me a kingdom of priests and a holy nation" (Exodus 19:6). The tabernacle reveals God\'s desire to dwell among His people — fulfilled ultimately in Christ (John 1:14) and the Church (1 Corinthians 3:16).',
          },
          {
            title: 'Leviticus, Numbers, Deuteronomy: Holiness, Wilderness, and Renewal',
            type: 'pdf',
            duration: '25 min',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            content:
              'Leviticus reveals God\'s holiness and the sacrificial system pointing to Christ (Hebrews 10:1). Numbers records Israel\'s wilderness wanderings — a warning against unbelief (1 Corinthians 10:5-6). Deuteronomy renews the covenant before entering the Promised Land, calling Israel to love God wholeheartedly: "You shall love the LORD your God with all your heart, with all your soul, and with all your strength" (Deuteronomy 6:5).',
          },
        ],
        quiz: {
          title: 'Practice Quiz: The Law',
          type: 'practice',
          questions: [
            {
              text: 'Genesis 3:15 is called the "protoevangelium" because it:',
              options: '["Describes the creation of the world", "Contains the first promise of a Redeemer", "Explains the origin of sin", "Records the first prayer"]',
              correctAnswer: 'Contains the first promise of a Redeemer',
              explanation:
                'Genesis 3:15 is the first gospel promise — God declares that the seed of the woman will crush the serpent\'s head, pointing to Christ\'s victory over Satan.',
              points: 1,
            },
            {
              text: 'The Passover in Exodus 12 prefigures:',
              options: '["The giving of the Law", "Christ, our Passover Lamb", "The crossing of the Red Sea", "The building of the tabernacle"]',
              correctAnswer: 'Christ, our Passover Lamb',
              explanation:
                'Paul explicitly connects Passover to Christ: "Christ, our Passover, was sacrificed for us" (1 Corinthians 5:7).',
              points: 1,
            },
            {
              text: 'Deuteronomy 6:5 commands:',
              options: '["Observe the Sabbath", "Love God with all your heart, soul, and strength", "Build the temple", "Make sacrifices daily"]',
              correctAnswer: 'Love God with all your heart, soul, and strength',
              explanation:
                'The Shema (Deuteronomy 6:4-5) commands total devotion: "You shall love the LORD your God with all your heart, with all your soul, and with all your strength."',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Pentateuch Reflection Essay',
          description:
            'Write a 600-word essay tracing the theme of "covenant" through Genesis, Exodus, and Deuteronomy. How does God\'s covenant relationship with Israel develop from Abraham to Sinai to the plains of Moab? What does faithfulness to covenant look like in each stage?',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'History and Poetry: Joshua through Song of Solomon',
        description: 'Israel\'s history in the land and the poetry of worship and wisdom.',
        order: 1,
        lessons: [
          {
            title: 'Joshua through 2 Chronicles: Conquest, Kingdom, and Exile',
            type: 'video',
            duration: '28 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Joshua leads the conquest (Joshua 1:9 — "Be strong and of good courage"). Judges reveals the cycle of sin, oppression, repentance, and deliverance. Ruth shows God\'s grace to a Gentile. Samuel, Kings, and Chronicles trace the united kingdom (Saul, David, Solomon), the divided kingdom (Israel and Judah), and the exile. Through it all, God remains faithful to His covenant despite Israel\'s unfaithfulness.',
          },
          {
            title: 'Psalms: The Hymnbook of God\'s People',
            type: 'text',
            duration: '22 min',
            mediaUrl: null,
            content:
              'The Psalms express every human emotion before God — joy, grief, anger, fear, doubt, and praise. Psalm 23 comforts the grieving. Psalm 51 models repentance. Psalm 119 celebrates God\'s Word. Psalm 150 invites unrestrained praise. Jesus quoted Psalm 22 on the cross: "My God, My God, why have You forsaken Me?" The Psalms teach us to bring our whole, unfiltered selves to God.',
          },
          {
            title: 'Proverbs and Ecclesiastes: Wisdom for Life',
            type: 'audio',
            duration: '20 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Proverbs 9:10 declares, "The fear of the LORD is the beginning of wisdom." Biblical wisdom is not mere intelligence — it is living in reverent submission to God. Ecclesiastes exposes the emptiness of life "under the sun" without God, concluding: "Fear God and keep His commandments, for this is man\'s all" (Ecclesiastes 12:13). True wisdom begins and ends with God.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: History and Poetry',
          type: 'practice',
          questions: [
            {
              text: 'The cycle in the book of Judges is:',
              options: '["Peace, prosperity, independence, blessing", "Sin, oppression, repentance, deliverance", "War, victory, celebration, rest", "Covenant, law, obedience, reward"]',
              correctAnswer: 'Sin, oppression, repentance, deliverance',
              explanation:
                'Judges repeats the cycle of Israel\'s sin → enemy oppression → crying out to God → God raising a judge to deliver them.',
              points: 1,
            },
            {
              text: 'Proverbs 9:10 teaches that the beginning of wisdom is:',
              options: '["Education", "Experience", "The fear of the LORD", "Intelligence"]',
              correctAnswer: 'The fear of the LORD',
              explanation:
                'True wisdom starts not with human intellect but with reverent awe and submission to God — "the fear of the LORD is the beginning of wisdom."',
              points: 1,
            },
            {
              text: 'Ecclesiastes concludes that the whole duty of man is to:',
              options: '["Accumulate wealth", "Seek pleasure", "Fear God and keep His commandments", "Study philosophy"]',
              correctAnswer: 'Fear God and keep His commandments',
              explanation:
                'After exploring all of life\'s pursuits, the Preacher concludes: "Fear God and keep His commandments, for this is man\'s all" (Ecclesiastes 12:13).',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Psalm Study Project',
          description:
            'Select one Psalm of at least 10 verses. Write a 500-word study identifying: the type of Psalm (lament, praise, wisdom, royal, etc.), its literary structure, key themes, and how it points to Christ. Then write a personal prayer based on this Psalm.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'The Prophets: Isaiah through Malachi',
        description: 'God\'s messengers calling Israel to repentance and revealing the coming Messiah.',
        order: 2,
        lessons: [
          {
            title: 'Isaiah: The Gospel of the Old Testament',
            type: 'video',
            duration: '30 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Isaiah is quoted in the New Testament over 60 times — more than any other prophet. Isaiah 53 provides the most detailed prophecy of Christ\'s suffering: "He was wounded for our transgressions, He was bruised for our iniquities; the chastisement for our peace was upon Him, and by His stripes we are healed." Isaiah 9:6 foretells His divine nature: "His name will be called Wonderful, Counselor, Mighty God, Everlasting Father, Prince of Peace."',
          },
          {
            title: 'Jeremiah and Ezekiel: Warning and Restoration',
            type: 'text',
            duration: '22 min',
            mediaUrl: null,
            content:
              'Jeremiah, the "weeping prophet," warned of coming judgment but also proclaimed God\'s new covenant: "I will put My law in their minds, and write it on their hearts" (Jeremiah 31:33). Ezekiel saw the valley of dry bones — Israel restored by God\'s Spirit (Ezekiel 37). Both prophets reveal that judgment is real but not final; God\'s restoration is always available to the repentant.',
          },
          {
            title: 'The Minor Prophets: Major Messages',
            type: 'audio',
            duration: '20 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'The twelve Minor Prophets are "minor" only in length, not significance. Hosea demonstrates God\'s relentless love through his marriage to an unfaithful wife. Jonah reveals God\'s mercy to all nations. Micah 6:8 summarizes God\'s requirement: "Do justly, love mercy, walk humbly with your God." Malachi closes the Old Testament with a promise of the coming "Sun of Righteousness" (Malachi 4:2), setting the stage for the New Testament.',
          },
        ],
        quiz: {
          title: 'Final Exam: Old Testament Survey',
          type: 'final',
          questions: [
            {
              text: 'Genesis 3:15 (the protoevangelium) promises:',
              options: '["A new garden", "The seed of the woman will crush the serpent\'s head", "That Eve will have many children", "The ground will be cursed forever"]',
              correctAnswer: "The seed of the woman will crush the serpent's head",
              explanation:
                'Genesis 3:15 promises that the woman\'s offspring will crush the serpent\'s head — the first promise of Christ\'s victory over Satan.',
              points: 2,
            },
            {
              text: 'Isaiah 53 describes the coming Messiah as:',
              options: '["A conquering political king", "Wounded for our transgressions and bruised for our iniquities", "A wealthy ruler", "A military general"]',
              correctAnswer: 'Wounded for our transgressions and bruised for our iniquities',
              explanation:
                'Isaiah 53 provides the most detailed prophecy of Christ\'s atoning suffering — "He was wounded for our transgressions, bruised for our iniquities."',
              points: 2,
            },
            {
              text: 'Jeremiah 31:33 prophesies a new covenant in which God will:',
              options: '["Rebuild the temple", "Put His law in their minds and write it on their hearts", "Give them a new land", "Make them wealthy"]',
              correctAnswer: 'Put His law in their minds and write it on their hearts',
              explanation:
                'Jeremiah prophesied an internal transformation — God writing His law on hearts, fulfilled in the New Covenant through Christ (Hebrews 8:10).',
              points: 2,
            },
            {
              text: 'Micah 6:8 summarizes God\'s requirement as:',
              options: '["Offer many sacrifices", "Do justly, love mercy, walk humbly with your God", "Build a great temple", "Fast frequently"]',
              correctAnswer: 'Do justly, love mercy, walk humbly with your God',
              explanation:
                'Micah 6:8 distills God\'s requirement to three essentials: justice, mercy, and humble fellowship with God.',
              points: 2,
            },
            {
              text: 'The Old Testament closes with Malachi\'s promise of:',
              options: '["The rebuilding of Jerusalem", "The Sun of Righteousness who will arise with healing", "A new king like David", "The destruction of all enemies"]',
              correctAnswer: 'The Sun of Righteousness who will arise with healing',
              explanation:
                'Malachi 4:2 promises the "Sun of Righteousness" who will arise with healing in His wings — pointing to Christ\'s coming.',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'Old Testament Christology Essay',
          description:
            'Write an 800-word essay tracing how the Old Testament points forward to Christ. Use at least five specific examples from different OT books (e.g., Genesis 3:15, Exodus 12, Isaiah 53, etc.) and explain how each foreshadows Jesus. How does understanding these connections deepen your appreciation of God\'s redemptive plan?',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
  {
    title: 'Christian Ethics & Moral Living',
    description:
      'Navigate the complex moral landscape of our world with biblical clarity. This course examines ethical issues through the lens of Scripture, equipping believers to make wise, Christ-honoring decisions in every area of life.',
    category: 'Management',
    level: 'Intermediate',
    duration: '8 weeks',
    instructor: 'Rev. Joseph Adeyemi',
    featured: false,
    enrolled: 134,
    rating: 4.5,
    image: '/images/ethics.jpg',
    modules: [
      {
        title: 'Foundations of Christian Ethics',
        description: 'The biblical basis for moral decision-making.',
        order: 0,
        lessons: [
          {
            title: 'God\'s Character as the Foundation of Ethics',
            type: 'video',
            duration: '25 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Christian ethics is not arbitrary rule-keeping — it is rooted in the very character of God. Leviticus 19:2 commands, "You shall be holy, for I the LORD your God am holy." God\'s moral law reflects His nature. What is right is right because it aligns with who God is. What is wrong is wrong because it contradicts His character. This makes Christian ethics objective, universal, and unchanging.',
          },
          {
            title: 'The Ten Commandments: God\'s Moral Framework',
            type: 'text',
            duration: '22 min',
            mediaUrl: null,
            content:
              'Exodus 20:1-17 provides the foundational moral framework. The first four commandments govern our relationship with God (no other gods, no idols, revering God\'s name, keeping Sabbath). The last six govern our relationships with others (honoring parents, no murder, no adultery, no stealing, no false witness, no coveting). Jesus summarized all of this in two commands: love God and love your neighbor (Matthew 22:37-40).',
          },
          {
            title: 'The Sermon on the Mount: Ethics of the Kingdom',
            type: 'pdf',
            duration: '25 min',
            mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            content:
              'Matthew 5-7 elevates ethics beyond external compliance to matters of the heart. Jesus says anger is murder (5:21-22), lust is adultery (5:27-28), and retaliation must be replaced by love for enemies (5:43-44). The Beatitudes (5:3-12) redefine blessing — the poor in spirit, the meek, the merciful, the peacemakers are called blessed. Kingdom ethics are radical, counter-cultural, and impossible without the Spirit\'s empowerment.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Foundations of Christian Ethics',
          type: 'practice',
          questions: [
            {
              text: 'According to Leviticus 19:2, the basis for our holiness is:',
              options: '["Our own moral effort", "God\'s holy character", "Cultural standards", "Religious tradition"]',
              correctAnswer: "God's holy character",
              explanation:
                'God commands holiness on the basis of His own nature: "You shall be holy, for I the LORD your God am holy." Our ethics flow from His character.',
              points: 1,
            },
            {
              text: 'Jesus summarized the Ten Commandments as:',
              options: '["Follow the law perfectly", "Love God and love your neighbor", "Attend synagogue regularly", "Avoid all sin"]',
              correctAnswer: 'Love God and love your neighbor',
              explanation:
                'Jesus summarized the entire Law in two commands: "You shall love the LORD your God" and "You shall love your neighbor as yourself" (Matthew 22:37-40).',
              points: 1,
            },
            {
              text: 'In the Sermon on the Mount, Jesus teaches that anger is akin to:',
              options: '["Righteousness", "Murder", "Justice", "Weakness"]',
              correctAnswer: 'Murder',
              explanation:
                'Jesus equates sinful anger with murder in God\'s eyes (Matthew 5:21-22) — kingdom ethics addresses the heart, not just external behavior.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Ethical Foundations Essay',
          description:
            'Write a 600-word essay explaining why God\'s character is a better foundation for ethics than cultural consensus or personal preference. Use specific biblical examples and address the objection: "Can\'t people be good without believing in God?"',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Contemporary Ethical Issues',
        description: 'Applying biblical principles to modern moral challenges.',
        order: 1,
        lessons: [
          {
            title: 'The Sanctity of Human Life',
            type: 'video',
            duration: '28 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'Genesis 1:27 declares that humans are created in God\'s image (imago Dei). This gives every person — from conception to natural death — inherent, inviolable dignity. Psalm 139:13-16 reveals God\'s intimate involvement in forming us in the womb. The sanctity of life ethic applies to abortion, euthanasia, racial justice, care for the poor, and capital punishment. Every human life matters because every human bears God\'s image.',
          },
          {
            title: 'Biblical Sexuality and Marriage',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'Genesis 2:24 establishes marriage as one man and one woman united for life. Jesus affirms this in Matthew 19:4-6. Hebrews 13:4 commands, "Marriage is honorable among all, and the bed undefiled." Biblical sexuality celebrates sex within marriage as God\'s good gift while calling for purity outside of it. In a culture of confusion, God\'s design brings clarity, joy, and protection.',
          },
          {
            title: 'Social Justice and the Christian Responsibility',
            type: 'audio',
            duration: '22 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Micah 6:8 calls us to "do justly, love mercy, and walk humbly with your God." Proverbs 31:8-9 commands us to "open your mouth for the speechless, in the cause of all who are appointed to dying." Isaiah 1:17 says, "Learn to do good; seek justice, rebuke the oppressor; defend the fatherless, plead for the widow." Biblical justice is not optional — it is an essential expression of loving God and neighbor.',
          },
        ],
        quiz: {
          title: 'Practice Quiz: Contemporary Ethical Issues',
          type: 'practice',
          questions: [
            {
              text: 'The biblical basis for the sanctity of human life is primarily:',
              options: '["Human intelligence", "Being created in the image of God (imago Dei)", "Social contracts", "Legal protections"]',
              correctAnswer: 'Being created in the image of God (imago Dei)',
              explanation:
                'Genesis 1:27 establishes that human dignity and worth come from being made in God\'s image — this is the foundation for the sanctity of life.',
              points: 1,
            },
            {
              text: 'Genesis 2:24 establishes marriage as:',
              options: '["A social construct that evolves", "One man and one woman united for life", "A temporary arrangement", "A purely legal contract"]',
              correctAnswer: 'One man and one woman united for life',
              explanation:
                'Genesis 2:24 defines marriage as a man and woman becoming "one flesh" — God\'s original design affirmed by Jesus in Matthew 19.',
              points: 1,
            },
            {
              text: 'Proverbs 31:8-9 commands believers to:',
              options: '["Focus only on personal piety", "Open their mouths for the speechless and defend the vulnerable", "Avoid political engagement", "Wait for others to act first"]',
              correctAnswer: 'Open their mouths for the speechless and defend the vulnerable',
              explanation:
                'Proverbs 31:8-9 calls God\'s people to active advocacy for those who cannot speak for themselves — justice is not passive.',
              points: 1,
            },
          ],
        },
        assignment: {
          title: 'Contemporary Ethics Position Paper',
          description:
            'Choose one contemporary ethical issue (sanctity of life, sexuality, social justice, or another approved topic). Write a 700-word position paper presenting the biblical perspective. Include: (1) relevant Scripture, (2) the cultural context of the issue, (3) the Christian response, and (4) practical ways believers can engage this issue with both truth and grace.',
          type: 'written',
          maxScore: 100,
        },
      },
      {
        title: 'Living Ethically in a Fallen World',
        description: 'Developing a Christian worldview and ethical decision-making framework.',
        order: 2,
        lessons: [
          {
            title: 'Developing a Christian Worldview',
            type: 'text',
            duration: '20 min',
            mediaUrl: null,
            content:
              'Romans 12:2 commands, "Do not be conformed to this world, but be transformed by the renewing of your mind." A Christian worldview sees all of life through the lens of Scripture — creation (God made all things good), fall (sin corrupted all things), redemption (Christ is restoring all things), and consummation (God will make all things new). This framework gives coherence to ethics, meaning to suffering, and hope for the future.',
          },
          {
            title: 'Ethical Decision-Making: A Biblical Framework',
            type: 'video',
            duration: '24 min',
            mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            content:
              'When facing ethical decisions, ask: (1) What does Scripture say? (2) What principles apply? (3) What would Jesus do? (4) What does the Holy Spirit counsel? (5) What would a mature believer advise? Proverbs 3:5-6 instructs: "Trust in the LORD with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths."',
          },
          {
            title: 'Being Salt and Light: Ethics in the Public Square',
            type: 'audio',
            duration: '18 min',
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            content:
              'Jesus calls us to be "salt and light" (Matthew 5:13-16). Salt preserves and flavors — Christians must preserve moral goodness in a decaying culture. Light exposes and guides — we must shine truth in darkness. We engage the public square not with self-righteousness but with humble conviction, knowing that our ultimate allegiance is to God\'s kingdom while loving our neighbors in this one.',
          },
        ],
        quiz: {
          title: 'Final Exam: Christian Ethics & Moral Living',
          type: 'final',
          questions: [
            {
              text: 'Romans 12:2 calls believers to be transformed by:',
              options: '["Positive thinking", "The renewing of the mind", "Cultural adaptation", "Self-improvement techniques"]',
              correctAnswer: 'The renewing of the mind',
              explanation:
                'Paul commands transformation through "the renewing of your mind" — a Spirit-empowered reshaping of our thinking according to God\'s truth.',
              points: 2,
            },
            {
              text: 'The Christian worldview framework includes:',
              options: '["Only the New Testament", "Creation, Fall, Redemption, and Consummation", "Only moral rules", "Personal opinion and cultural norms"]',
              correctAnswer: 'Creation, Fall, Redemption, and Consummation',
              explanation:
                'The biblical worldview tells a four-part story: God created all things good, sin corrupted all things, Christ is redeeming all things, and God will make all things new.',
              points: 2,
            },
            {
              text: 'In Matthew 5:13-16, Jesus calls believers to be:',
              options: '["Silent observers", "Salt and light in the world", "Separate from society", "Political leaders"]',
              correctAnswer: 'Salt and light in the world',
              explanation:
                'Jesus calls us to actively engage culture as salt (preserving goodness) and light (exposing truth and guiding toward God).',
              points: 2,
            },
            {
              text: 'Proverbs 3:5-6 instructs us to:',
              options: '["Trust our own understanding", "Trust in the LORD with all our heart and lean not on our own understanding", "Follow popular opinion", "Rely on experts"]',
              correctAnswer: 'Trust in the LORD with all our heart and lean not on our own understanding',
              explanation:
                'Proverbs 3:5-6 calls for wholehearted trust in God rather than self-reliance, with the promise that He will direct our paths.',
              points: 2,
            },
            {
              text: 'The imago Dei (image of God) in Genesis 1:27 means that:',
              options: '["Humans are like God in every way", "Every human has inherent, inviolable dignity", "Only believers reflect God\'s image", "Humans are divine"]',
              correctAnswer: 'Every human has inherent, inviolable dignity',
              explanation:
                'Being made in God\'s image gives every human being — regardless of status, ability, or belief — inherent worth and dignity that must be respected.',
              points: 2,
            },
          ],
        },
        assignment: {
          title: 'Personal Ethics Statement',
          description:
            'Write a 900-word personal ethics statement articulating your biblical framework for moral decision-making. Include: (1) Your core biblical convictions about right and wrong, (2) How you approach ethical gray areas, (3) Specific applications to your current life context (work, school, relationships), and (4) How you plan to grow in ethical maturity. This document should serve as a reference for your own life.',
          type: 'written',
          maxScore: 100,
        },
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean up ──────────────────────────────────────────────────────
  console.log('🧹 Cleaning existing data...');
  await prisma.note.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.courseFeedback.deleteMany();
  await prisma.libraryResource.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();

  // ─── Create Demo User ──────────────────────────────────────────────
  console.log('👤 Creating demo user...');
  const demoUser = await prisma.user.create({
    data: {
      email: 'student@dreamcraft.org',
      name: 'Grace Student',
      password: passwordHash,
      role: 'student',
      bio: 'A passionate student of God\'s Word, eager to grow in faith and knowledge.',
      country: 'Ghana',
      phone: '+233-555-0123',
    },
  });

  // ─── Create Admin User ──────────────────────────────────────────────
  console.log('👑 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dreamcraft.org',
      name: 'Admin DreamCraft',
      password: passwordHash,
      role: 'admin',
      bio: 'System administrator for DreamCraft Christian Institute.',
      country: 'Kenya',
      phone: '+254-700-0000',
    },
  });

  // ─── Create Instructor User ──────────────────────────────────────────
  console.log('🎓 Creating instructor user...');
  const instructorUser = await prisma.user.create({
    data: {
      email: 'instructor@dreamcraft.org',
      name: 'Dr. Samuel Mensah',
      password: passwordHash,
      role: 'instructor',
      bio: 'Senior lecturer in Christian Theology and Biblical Studies at DreamCraft Christian Institute. Passionate about equipping the next generation of Christian leaders.',
      country: 'Ghana',
      phone: '+233-555-0100',
    },
  });

  // ─── Create Courses with nested data ───────────────────────────────
  console.log('📚 Creating courses, modules, lessons, quizzes, and assignments...');
  const createdCourses: { id: string; title: string }[] = [];

  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        instructor: courseData.instructor,
        featured: courseData.featured,
        enrolled: courseData.enrolled,
        rating: courseData.rating,
        image: courseData.image,
        certificateEnabled: true,
        passingScore: 70,
        modules: {
          create: courseData.modules.map((mod) => ({
            title: mod.title,
            description: mod.description,
            order: mod.order,
            lessons: {
              create: mod.lessons.map((lesson, lessonIdx) => ({
                title: lesson.title,
                content: lesson.content,
                type: lesson.type,
                mediaUrl: lesson.mediaUrl,
                duration: lesson.duration,
                order: lessonIdx,
              })),
            },
            quizzes: {
              create: {
                title: mod.quiz.title,
                type: mod.quiz.type,
                timeLimit: mod.quiz.type === 'final' ? 45 : 30,
                passingScore: 70,
                maxAttempts: mod.quiz.type === 'final' ? 2 : 3,
                order: mod.order,
                questions: {
                  create: mod.quiz.questions.map((q, qIdx) => ({
                    text: q.text,
                    type: 'multiple_choice',
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    points: q.points,
                    order: qIdx,
                  })),
                },
              },
            },
            assignments: {
              create: {
                title: mod.assignment.title,
                description: mod.assignment.description,
                type: mod.assignment.type,
                maxScore: mod.assignment.maxScore,
                order: mod.order,
              },
            },
          })),
        },
      },
    });
    createdCourses.push({ id: course.id, title: course.title });
    console.log(`  ✅ Created: ${courseData.title}`);
  }

  // ─── Enroll Demo User in 3 Courses ────────────────────────────────
  console.log('📋 Enrolling demo user in courses...');

  // Course 1: ~30% progress (just starting)
  const course1 = createdCourses[0]; // Foundations of Christian Faith
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: demoUser.id,
      courseId: course1.id,
      progress: 30,
      overallGrade: 0,
      status: 'active',
      enrolledAt: daysAgo(14),
      lastAccessedAt: daysAgo(1),
    },
  });

  // Mark some lessons as completed for ~30% progress
  const course1Lessons = await prisma.lesson.findMany({
    where: { module: { courseId: course1.id } },
    orderBy: { order: 'asc' },
  });
  const lessonsToComplete1 = Math.ceil(course1Lessons.length * 0.3);
  for (let i = 0; i < lessonsToComplete1; i++) {
    await prisma.lessonProgress.create({
      data: {
        userId: demoUser.id,
        lessonId: course1Lessons[i].id,
        enrollmentId: enrollment1.id,
        completed: true,
        completedAt: daysAgo(14 - i),
        timeSpent: Math.floor(Math.random() * 600) + 300,
      },
    });
  }
  console.log(`  ✅ Enrolled in ${course1.title} (~30% progress)`);

  // Course 2: ~70% progress (mostly done)
  const course2 = createdCourses[3]; // Prayer & Spiritual Disciplines
  const enrollment2 = await prisma.enrollment.create({
    data: {
      userId: demoUser.id,
      courseId: course2.id,
      progress: 70,
      overallGrade: 85,
      status: 'active',
      enrolledAt: daysAgo(30),
      lastAccessedAt: daysAgo(2),
    },
  });

  const course2Lessons = await prisma.lesson.findMany({
    where: { module: { courseId: course2.id } },
    orderBy: { order: 'asc' },
  });
  const lessonsToComplete2 = Math.ceil(course2Lessons.length * 0.7);
  for (let i = 0; i < lessonsToComplete2; i++) {
    await prisma.lessonProgress.create({
      data: {
        userId: demoUser.id,
        lessonId: course2Lessons[i].id,
        enrollmentId: enrollment2.id,
        completed: true,
        completedAt: daysAgo(30 - i),
        timeSpent: Math.floor(Math.random() * 600) + 300,
      },
    });
  }

  // Add a quiz attempt for course 2
  const course2Quiz = await prisma.quiz.findFirst({
    where: { module: { courseId: course2.id }, type: 'practice' },
  });
  if (course2Quiz) {
    await prisma.quizAttempt.create({
      data: {
        userId: demoUser.id,
        quizId: course2Quiz.id,
        enrollmentId: enrollment2.id,
        score: 85,
        maxScore: 100,
        answers: '{}',
        passed: true,
        timeSpent: 420,
        startedAt: daysAgo(20),
        completedAt: daysAgo(20),
      },
    });
  }

  // Add an assignment submission for course 2
  const course2Assignment = await prisma.assignment.findFirst({
    where: { module: { courseId: course2.id } },
  });
  if (course2Assignment) {
    await prisma.assignmentSubmission.create({
      data: {
        userId: demoUser.id,
        assignmentId: course2Assignment.id,
        enrollmentId: enrollment2.id,
        content:
          'My prayer life has been deeply enriched through this course. Studying the Lord\'s Prayer in Matthew 6:9-13 has shown me that prayer is not about impressive words but about honest communion with our heavenly Father. I have begun using the Lord\'s Prayer as a daily framework, and it has transformed my prayer time from a rushed ritual into a meaningful conversation with God.',
        score: 88,
        feedback: 'Excellent reflection! You have engaged deeply with the Scripture and shown genuine personal application. Well done on connecting the Lord\'s Prayer to your daily practice.',
        status: 'graded',
        submittedAt: daysAgo(18),
        gradedAt: daysAgo(16),
      },
    });
  }
  console.log(`  ✅ Enrolled in ${course2.title} (~70% progress)`);

  // Course 3: 100% completed with certificate
  const course3 = createdCourses[4]; // Apologetics
  const enrollment3 = await prisma.enrollment.create({
    data: {
      userId: demoUser.id,
      courseId: course3.id,
      progress: 100,
      overallGrade: 92,
      status: 'completed',
      enrolledAt: daysAgo(60),
      completedAt: daysAgo(7),
      lastAccessedAt: daysAgo(7),
    },
  });

  // Mark all lessons as completed
  const course3Lessons = await prisma.lesson.findMany({
    where: { module: { courseId: course3.id } },
    orderBy: { order: 'asc' },
  });
  for (let i = 0; i < course3Lessons.length; i++) {
    await prisma.lessonProgress.create({
      data: {
        userId: demoUser.id,
        lessonId: course3Lessons[i].id,
        enrollmentId: enrollment3.id,
        completed: true,
        completedAt: daysAgo(60 - i * 3),
        timeSpent: Math.floor(Math.random() * 600) + 300,
      },
    });
  }

  // Add quiz attempts for course 3
  const course3Quizzes = await prisma.quiz.findMany({
    where: { module: { courseId: course3.id } },
  });
  for (const quiz of course3Quizzes) {
    await prisma.quizAttempt.create({
      data: {
        userId: demoUser.id,
        quizId: quiz.id,
        enrollmentId: enrollment3.id,
        score: quiz.type === 'final' ? 90 : 95,
        maxScore: 100,
        answers: '{}',
        passed: true,
        timeSpent: quiz.type === 'final' ? 1200 : 600,
        startedAt: daysAgo(15),
        completedAt: daysAgo(15),
      },
    });
  }

  // Add assignment submissions for course 3
  const course3Assignments = await prisma.assignment.findMany({
    where: { module: { courseId: course3.id } },
  });
  for (const assignment of course3Assignments) {
    await prisma.assignmentSubmission.create({
      data: {
        userId: demoUser.id,
        assignmentId: assignment.id,
        enrollmentId: enrollment3.id,
        content:
          'The cosmological argument provides a compelling case for God\'s existence. Beginning with the principle that everything that begins to exist has a cause, we can reason that the universe — which began to exist at the Big Bang — must have a cause. This cause must be timeless, spaceless, immaterial, and enormously powerful, consistent with the God described in Scripture. As Genesis 1:1 declares, "In the beginning God created the heavens and the earth."',
        score: 92,
        feedback: 'Thorough and well-reasoned argument with excellent biblical integration. Your logical flow is clear and you address key objections thoughtfully.',
        status: 'graded',
        submittedAt: daysAgo(12),
        gradedAt: daysAgo(10),
      },
    });
  }

  // Create certificate for completed course
  await prisma.certificate.create({
    data: {
      userId: demoUser.id,
      courseId: course3.id,
      enrollmentId: enrollment3.id,
      certificateNumber: `DC-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      finalGrade: 92,
      issuedAt: daysAgo(7),
    },
  });
  console.log(`  ✅ Enrolled in ${course3.title} (100% complete + certificate)`);

  // ─── Create Live Classes ───────────────────────────────────────────
  console.log('🎥 Creating live classes...');
  const liveClassesData = [
    {
      courseId: createdCourses[0].id, // Foundations
      title: 'Live Q&A: Understanding the Trinity',
      description:
        'Join Dr. Mensah for an interactive session exploring the doctrine of the Trinity. Bring your questions about how one God can exist in three Persons and why this doctrine matters for your faith.',
      instructor: 'Dr. Samuel Mensah',
      scheduledAt: daysFromNow(3),
      duration: 60,
      meetingUrl: 'https://meet.dreamcraft.org/trinity-qa',
      status: 'upcoming',
    },
    {
      courseId: createdCourses[1].id, // Hermeneutics
      title: 'Workshop: Interpreting Difficult Passages',
      description:
        'Prof. Osei leads a hands-on workshop on interpreting challenging biblical texts. We will work through specific difficult passages together, applying the grammatical-historical method step by step.',
      instructor: 'Prof. Esther Osei',
      scheduledAt: daysFromNow(7),
      duration: 90,
      meetingUrl: 'https://meet.dreamcraft.org/hermeneutics-workshop',
      status: 'upcoming',
    },
    {
      courseId: createdCourses[4].id, // Apologetics
      title: 'Debate Watch: The Problem of Evil',
      description:
        'Watch and discuss a recorded debate on the problem of evil, followed by a live discussion with Dr. Asante on how to respond thoughtfully and compassionately to this common objection.',
      instructor: 'Dr. Kwame Asante',
      scheduledAt: daysFromNow(10),
      duration: 75,
      meetingUrl: 'https://meet.dreamcraft.org/evil-debate',
      status: 'upcoming',
    },
    {
      courseId: createdCourses[2].id, // Leadership
      title: 'Panel: Women in Christian Leadership',
      description:
        'A panel discussion featuring women leaders from various ministry contexts. Hear their stories, learn from their wisdom, and engage in a conversation about biblical leadership that transcends gender stereotypes.',
      instructor: 'Rev. Joseph Adeyemi',
      scheduledAt: daysFromNow(14),
      duration: 60,
      meetingUrl: 'https://meet.dreamcraft.org/women-leadership',
      status: 'upcoming',
    },
  ];

  for (const lc of liveClassesData) {
    await prisma.liveClass.create({ data: lc });
  }
  console.log(`  ✅ Created ${liveClassesData.length} live classes`);

  // ─── Add a user note for demo ──────────────────────────────────────
  console.log('📝 Adding demo note...');
  const firstLesson = course1Lessons[0];
  if (firstLesson) {
    await prisma.note.create({
      data: {
        userId: demoUser.id,
        lessonId: firstLesson.id,
        content:
          'Key insight: Jeremiah 9:23-24 — Our glory should be in knowing God, not in our own achievements. This is countercultural! The world says glory in wisdom, might, and riches. God says glory in knowing HIM. How different would my life look if I truly lived this way?',
      },
    });
  }

  // ─── Create Forums ────────────────────────────────────────────────────
  console.log('💬 Creating forums for each course...');
  const createdForums: Record<number, { id: string; courseId: string }> = {};
  for (let i = 0; i < createdCourses.length; i++) {
    const c = createdCourses[i];
    const forum = await prisma.forum.create({
      data: {
        courseId: c.id,
        title: `${c.title} - Discussion Forum`,
        description: `Discuss topics related to ${c.title}`,
      },
    });
    createdForums[i] = { id: forum.id, courseId: c.id };
  }
  console.log(`  ✅ Created ${createdCourses.length} forums`);

  // ─── Create Forum Posts ───────────────────────────────────────────────
  console.log('💭 Creating forum discussion posts...');

  // Forum posts for Course 0: Foundations of Christian Faith
  const forum0Post1 = await prisma.forumPost.create({
    data: {
      forumId: createdForums[0].id,
      userId: demoUser.id,
      title: 'How do you explain the Trinity to a new believer?',
      content: 'I have been struggling to explain the doctrine of the Trinity to my friend who recently came to faith. The concept of one God in three Persons seems confusing to them. What illustrations or explanations have you found helpful? I want to be faithful to Scripture while making it accessible.',
    },
  });
  const forum0Post1Reply = await prisma.forumPost.create({
    data: {
      forumId: createdForums[0].id,
      userId: demoUser.id,
      parentId: forum0Post1.id,
      content: 'One analogy that helped me is thinking about water — it can exist as ice, liquid, and vapor, yet it is still H2O. Of course, no analogy is perfect, but it shows how one substance can exist in multiple forms simultaneously. Ultimately, the Trinity is a mystery we accept by faith, as Jesus commanded us to baptize in the name of the Father, Son, and Holy Spirit (Matthew 28:19).',
    },
  });
  const forum0Post2 = await prisma.forumPost.create({
    data: {
      forumId: createdForums[0].id,
      userId: demoUser.id,
      title: 'Sharing my testimony: How this course transformed my understanding of faith',
      content: 'Before taking this course, I thought faith was just believing without evidence. Hebrews 11:1 showed me that faith is "the substance of things hoped for, the evidence of things not seen." It is not blind optimism but confident trust based on God\'s proven character. The Hall of Faith examples — Abraham, Moses, Rahab — are powerful reminders that faith means trusting God even when we cannot see the outcome. Has anyone else had a similar realization?',
    },
  });
  const forum0Post2Reply = await prisma.forumPost.create({
    data: {
      forumId: createdForums[0].id,
      userId: demoUser.id,
      parentId: forum0Post2.id,
      content: 'Absolutely! The distinction between biblical faith and "blind faith" was revolutionary for me too. The examples in Hebrews 11 show real people who had real encounters with God — their faith was based on His track record of faithfulness. That gives me courage to trust Him with my own "impossible" situations.',
    },
  });

  // Forum posts for Course 4: Apologetics
  const forum4Post1 = await prisma.forumPost.create({
    data: {
      forumId: createdForums[4].id,
      userId: demoUser.id,
      title: 'Practical tips for defending the faith in everyday conversations',
      content: 'After completing the Apologetics course, I feel much more equipped to defend my faith. However, I still find it challenging to bring up these topics naturally in conversation without seeming argumentative. What strategies have worked for you? I am especially interested in how to respond when friends question the existence of God or the reliability of Scripture.',
    },
  });
  const forum4Post1Reply = await prisma.forumPost.create({
    data: {
      forumId: createdForums[4].id,
      userId: demoUser.id,
      parentId: forum4Post1.id,
      content: 'Great question! One approach I have found effective is asking questions rather than making statements. When someone questions God\'s existence, I might ask, "What evidence would convince you?" This shifts the conversation from confrontation to genuine dialogue. Also, 1 Peter 3:15 reminds us to defend our hope "with gentleness and respect" — our attitude matters as much as our arguments.',
    },
  });
  const forum4Post2 = await prisma.forumPost.create({
    data: {
      forumId: createdForums[4].id,
      userId: demoUser.id,
      title: 'The moral argument: Why objective morality points to God',
      content: 'One of the most compelling arguments from this course was the moral argument. If objective moral values exist (and most people agree they do — e.g., "torturing children for fun is wrong"), then there must be a moral lawgiver. Without God, morality is just subjective preference. C.S. Lewis captured this beautifully in Mere Christianity. Has anyone used this argument in real conversations? I would love to hear your experiences.',
    },
  });

  // Forum posts for Course 2: Christian Leadership & Ministry
  const forum2Post1 = await prisma.forumPost.create({
    data: {
      forumId: createdForums[2].id,
      userId: demoUser.id,
      title: 'Balancing humility and boldness in Christian leadership',
      content: 'This course taught me that Christian leadership is servant leadership (Mark 10:42-45). But I sometimes struggle with the tension between being humble and being bold in my convictions. How do you maintain servant-hearted humility while still leading with confidence and vision? I would appreciate practical wisdom from those in ministry.',
    },
  });
  const forum2Post1Reply = await prisma.forumPost.create({
    data: {
      forumId: createdForums[2].id,
      userId: demoUser.id,
      parentId: forum2Post1.id,
      content: 'I think the key is remembering that our confidence comes from Christ, not ourselves. Paul says in 2 Corinthians 3:5, "Not that we are sufficient of ourselves to think of anything as being from ourselves, but our sufficiency is from God." When our boldness is rooted in His calling and empowerment rather than our own ego, humility and confidence coexist naturally.',
    },
  });

  // Forum posts for Course 3: Prayer & Spiritual Disciplines
  const forum3Post1 = await prisma.forumPost.create({
    data: {
      forumId: createdForums[3].id,
      userId: demoUser.id,
      title: 'Building a consistent prayer life: Tips that actually work',
      content: 'This course has deeply challenged me about my prayer life. I know prayer is essential, but I struggle with consistency. What practical habits have helped you maintain a regular prayer routine? I have started using the ACTS model (Adoration, Confession, Thanksgiving, Supplication) from this course and it has really helped me stay focused during prayer time.',
    },
  });
  const forum3Post1Reply = await prisma.forumPost.create({
    data: {
      forumId: createdForums[3].id,
      userId: demoUser.id,
      parentId: forum3Post1.id,
      content: 'The ACTS model has been transformative for me too! Another thing that helps is setting a specific time and place for prayer. Jesus Himself modeled this — Luke 5:16 says He "withdrew into the wilderness and prayed." Having a dedicated space signals to my mind and heart that it is time to commune with God. Also, journaling my prayers helps me stay focused and track how God answers over time.',
    },
  });

  console.log(`  ✅ Created forum posts and replies`);

  // ─── Create Library Resources ────────────────────────────────────────
  console.log('📖 Creating library resources...');
  const libraryResources = [
    // Books
    {
      title: 'Systematic Theology',
      description: 'A comprehensive introduction to Christian doctrine, covering the doctrines of God, Christ, the Holy Spirit, salvation, and the church with clarity and biblical faithfulness.',
      type: 'book',
      author: 'Wayne Grudem',
      url: 'https://example.com/books/systematic-theology',
      courseId: null,
    },
    {
      title: 'Mere Christianity',
      description: 'C.S. Lewis\'s classic defense of the Christian faith, exploring the logical and philosophical foundations of Christian belief in an accessible and compelling way.',
      type: 'book',
      author: 'C.S. Lewis',
      url: 'https://example.com/books/mere-christianity',
      courseId: createdCourses[4].id, // Apologetics
    },
    {
      title: 'Knowing God',
      description: 'A profound exploration of the nature and character of God, helping believers move beyond mere knowledge about God to truly knowing Him personally and deeply.',
      type: 'book',
      author: 'J.I. Packer',
      url: 'https://example.com/books/knowing-god',
      courseId: createdCourses[0].id, // Foundations
    },
    {
      title: 'The Cost of Discipleship',
      description: 'Dietrich Bonhoeffer\'s penetrating analysis of what it truly means to follow Christ, distinguishing between cheap grace and costly grace with prophetic urgency.',
      type: 'book',
      author: 'Dietrich Bonhoeffer',
      url: 'https://example.com/books/cost-of-discipleship',
      courseId: null,
    },
    {
      title: 'How to Read the Bible for All Its Worth',
      description: 'A practical guide to biblical interpretation that helps readers understand different genres of Scripture and apply sound hermeneutical principles.',
      type: 'book',
      author: 'Gordon D. Fee & Douglas Stuart',
      url: 'https://example.com/books/how-to-read-bible',
      courseId: createdCourses[1].id, // Biblical Hermeneutics
    },
    // Articles
    {
      title: 'The Authority of Scripture in Christian Education',
      description: 'An academic article examining the foundational role of biblical authority in shaping Christian educational philosophy and curriculum design.',
      type: 'article',
      author: 'Dr. Mary Thompson',
      url: 'https://example.com/articles/authority-scripture-education',
      courseId: null,
    },
    {
      title: 'Spiritual Formation in the Digital Age',
      description: 'Exploring how technology impacts spiritual disciplines and offering practical guidance for maintaining depth in an age of distraction.',
      type: 'article',
      author: 'Rev. Daniel Kwame',
      url: 'https://example.com/articles/spiritual-formation-digital',
      courseId: createdCourses[3].id, // Prayer & Spiritual Disciplines
    },
    {
      title: 'Servant Leadership: A Biblical Model for the 21st Century Church',
      description: 'A research article analyzing Jesus\' model of servant leadership and its implications for contemporary church leadership structures.',
      type: 'article',
      author: 'Prof. James Osei-Mensah',
      url: 'https://example.com/articles/servant-leadership',
      courseId: createdCourses[2].id, // Christian Leadership
    },
    {
      title: 'Defending the Resurrection: Historical Evidence and Apologetic Method',
      description: 'A scholarly article presenting the historical evidence for the bodily resurrection of Christ and evaluating major apologetic approaches.',
      type: 'article',
      author: 'Dr. William Lane Craig',
      url: 'https://example.com/articles/defending-resurrection',
      courseId: createdCourses[4].id, // Apologetics
    },
    // Videos
    {
      title: 'Lecture: Introduction to Biblical Hermeneutics',
      description: 'Prof. Esther Osei delivers a comprehensive introduction to the principles of biblical interpretation, covering the grammatical-historical method and common interpretive fallacies.',
      type: 'video',
      author: 'Prof. Esther Osei',
      url: 'https://example.com/videos/intro-hermeneutics',
      courseId: createdCourses[1].id, // Biblical Hermeneutics
    },
    {
      title: 'Workshop: Developing a Powerful Prayer Life',
      description: 'A practical workshop on building a consistent and meaningful prayer life, featuring guided prayer exercises and time-tested spiritual disciplines.',
      type: 'video',
      author: 'Rev. Sarah Agyeman',
      url: 'https://example.com/videos/prayer-workshop',
      courseId: createdCourses[3].id, // Prayer & Spiritual Disciplines
    },
    {
      title: 'Debate: Does God Exist? A Christian-Atheist Dialogue',
      description: 'A respectful and rigorous debate between a Christian apologist and an atheist philosopher, demonstrating how to engage with opposing worldviews charitably and convincingly.',
      type: 'video',
      author: 'DreamCraft Institute',
      url: 'https://example.com/videos/god-exists-debate',
      courseId: null,
    },
    // Audio
    {
      title: 'Sermon Series: Walking by Faith',
      description: 'A powerful 8-part sermon series on Hebrews 11, exploring the lives of the heroes of faith and applying their lessons to modern Christian living.',
      type: 'audio',
      author: 'Rev. Joseph Adeyemi',
      url: 'https://example.com/audio/walking-by-faith',
      courseId: createdCourses[0].id, // Foundations
    },
    {
      title: 'Podcast: Apologetics in Everyday Life',
      description: 'A podcast episode featuring practical conversations about defending the Christian faith in the workplace, with family, and in everyday situations.',
      type: 'audio',
      author: 'DreamCraft Institute',
      url: 'https://example.com/audio/apologetics-everyday',
      courseId: createdCourses[4].id, // Apologetics
    },
    // Documents
    {
      title: 'Old Testament Survey Study Guide',
      description: 'A comprehensive study guide covering the major themes, historical context, and theological messages of each Old Testament book.',
      type: 'document',
      author: 'Dr. Akua Mensah',
      url: 'https://example.com/documents/ot-survey-guide',
      courseId: createdCourses[6].id, // Old Testament Survey
    },
    {
      title: 'Christian Ethics Case Study Workbook',
      description: 'A practical workbook with real-world case studies exploring ethical dilemmas through the lens of biblical principles and Christian moral reasoning.',
      type: 'document',
      author: 'Dr. Samuel Mensah',
      url: 'https://example.com/documents/ethics-workbook',
      courseId: createdCourses[7].id, // Christian Ethics
    },
    {
      title: 'New Testament Survey Reading Plan',
      description: 'A structured 12-week reading plan through the New Testament with daily readings, reflection questions, and key themes for each book.',
      type: 'document',
      author: 'Prof. Esther Osei',
      url: 'https://example.com/documents/nt-reading-plan',
      courseId: createdCourses[5].id, // New Testament Survey
    },
  ];

  for (const resource of libraryResources) {
    await prisma.libraryResource.create({
      data: {
        title: resource.title,
        description: resource.description,
        type: resource.type,
        author: resource.author,
        url: resource.url,
        courseId: resource.courseId,
        uploadedBy: demoUser.id,
      },
    });
  }
  console.log(`  ✅ Created ${libraryResources.length} library resources`);

  // ─── Create Site Settings ─────────────────────────────────────────────
  console.log('⚙️ Creating site settings...');
  await prisma.siteSetting.createMany({
    data: [
      { key: 'siteName', value: 'DreamCraft Christian Institute' },
      { key: 'siteLogo', value: '' },
      { key: 'siteTagline', value: 'Walk in Faith, Grow in Knowledge' },
    ],
  });
  console.log('  ✅ Created 3 site settings');

  // ─── Create Course Feedback ──────────────────────────────────────────
  console.log('⭐ Creating course feedback...');
  await prisma.courseFeedback.create({
    data: {
      userId: demoUser.id,
      courseId: course3.id,
      enrollmentId: enrollment3.id,
      rating: 5,
      feedback: 'Excellent course that strengthened my faith and gave me practical tools for defending the Gospel.',
    },
  });
  console.log('  ✅ Created course feedback for Apologetics');

  // ─── Summary ───────────────────────────────────────────────────────
  console.log('\n✅ Seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`   👤 3 Demo users: student / admin / instructor (all password: demo123)`);
  console.log(`   📚 ${createdCourses.length} Courses`);
  console.log(`   📋 3 Enrollments (30%, 70%, 100% progress)`);
  console.log(`   🎓 1 Certificate issued`);
  console.log(`   🎥 ${liveClassesData.length} Upcoming live classes`);
  console.log(`   📝 1 Demo note`);
  console.log(`   💬 ${createdCourses.length} Forums with discussion posts`);
  console.log(`   📖 ${libraryResources.length} Library resources`);
  console.log(`   ⚙️ 3 Site settings`);
  console.log(`   ⭐ 1 Course feedback`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
