import type { DistortionDefinition } from '../types'

export const DISTORTIONS: DistortionDefinition[] = [
  {
    id: 'catastrophizing',
    name: 'Catastrophizing',
    shortDesc: 'Expecting the worst outcome and treating it as likely, or as something you could not cope with.',
    clinicalAntidote:
      'Name the worst case, the best case, and the most realistic case. Then ask how you would cope if the worst did happen.',
    example: '"If this presentation goes badly, my career is over."',
    challengeQuestion: 'What is most likely to happen, and how would I cope if the worst did?',
    commonPhrase: '"What if everything falls apart?"',
  },
  {
    id: 'all_or_nothing',
    name: 'All-or-Nothing Thinking',
    shortDesc: 'Seeing things in black and white. Anything short of perfect counts as failure.',
    clinicalAntidote:
      'Rate the situation from 0 to 100 instead of sorting it into two boxes. Look for what was partly right or good enough.',
    example: '"I skipped the gym today, so this whole week is ruined."',
    challengeQuestion: 'Can this be 80% fine even if 20% went wrong?',
    commonPhrase: '"Either I nail it or I\'m a failure."',
  },
  {
    id: 'mind_reading',
    name: 'Mind Reading',
    shortDesc: 'Assuming you know what other people think, usually that they are judging you, without checking.',
    clinicalAntidote:
      'Treat the assumption as a guess. List other explanations, look for real evidence, or ask the person.',
    example: '"She hasn\'t replied to my email, so she must be annoyed with me."',
    challengeQuestion: 'What are three other reasons they might have acted this way?',
    commonPhrase: '"I just know they think less of me."',
  },
  {
    id: 'fortune_telling',
    name: 'Fortune Telling',
    shortDesc: 'Predicting a bad outcome as if it were already certain, before you have the facts.',
    clinicalAntidote:
      'Stay with what is known today. Say "I don\'t know yet" out loud, and notice how often past predictions came true.',
    example: '"If I speak up in the meeting, everyone will ignore me."',
    challengeQuestion: 'Can I be sure of this future before I have given it a chance?',
    commonPhrase: '"I already know how this ends."',
  },
  {
    id: 'emotional_reasoning',
    name: 'Emotional Reasoning',
    shortDesc: 'Treating a feeling as proof that something is true.',
    clinicalAntidote:
      'Separate the two: "I feel ___, and the facts I can point to are ___." Feelings are real data about you, not about the world.',
    example: '"I feel like an imposter, so I must not belong here."',
    challengeQuestion: 'Is this a fact, or is it how I feel right now?',
    commonPhrase: '"I feel it, so it must be true."',
  },
  {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    shortDesc: 'Turning one event into a never-ending pattern. Watch for "always" and "never".',
    clinicalAntidote: 'Replace "always" and "never" with "this time". Look for exceptions, even small ones.',
    example: '"I didn\'t get this project. Nobody will ever want to work with me."',
    challengeQuestion: 'Is this true every time, or can I think of exceptions?',
    commonPhrase: '"This always happens to me."',
  },
  {
    id: 'should_statements',
    name: '"Should" Statements',
    shortDesc: 'Holding yourself or others to rigid rules, then feeling guilt or anger when they break.',
    clinicalAntidote: 'Swap "should" for "I would prefer" or "it would help if". Notice whose rule this really is.',
    example: '"I should never feel overwhelmed. Everyone else copes fine."',
    challengeQuestion: 'Who made this rule? Would I hold a friend to it?',
    commonPhrase: '"I must never make mistakes."',
  },
  {
    id: 'mental_filter',
    name: 'Mental Filter',
    shortDesc: 'Fixating on one negative detail until it colors everything, and screening out the rest.',
    clinicalAntidote: 'Deliberately list three neutral or positive things that were also true.',
    example: '"Nine good comments and one critical one, and all I can think about is the critical one."',
    challengeQuestion: 'What am I screening out? What else is true here?',
    commonPhrase: '"That one mistake ruined everything."',
  },
  {
    id: 'discounting_positive',
    name: 'Discounting the Positive',
    shortDesc: 'Dismissing good things as flukes, luck, or politeness so they do not count.',
    clinicalAntidote: 'Treat your own good outcomes the way you would treat a friend\'s. If it happened, it counts.',
    example: '"She only praised my work to be polite."',
    challengeQuestion: 'If this happened to someone else, would I count it?',
    commonPhrase: '"That doesn\'t count."',
  },
  {
    id: 'personalization',
    name: 'Personalization',
    shortDesc: 'Taking responsibility for things that are not entirely, or at all, in your control.',
    clinicalAntidote:
      'Draw a responsibility pie. List every factor that contributed, give each a slice, and see how big yours really is.',
    example: '"The client seemed in a bad mood. It must be because I said something wrong."',
    challengeQuestion: 'What else could have contributed? What part is truly mine?',
    commonPhrase: '"It\'s all my fault."',
  },
  {
    id: 'labeling',
    name: 'Labeling',
    shortDesc: 'Defining yourself or someone else by a single act or trait.',
    clinicalAntidote:
      'Describe the behavior, not the person. "I missed a deadline" is an event; "I\'m a fraud" is a verdict.',
    example: '"I missed the deadline. I\'m an incompetent fraud."',
    challengeQuestion: 'Would I sum up a friend by one moment like this?',
    commonPhrase: '"I\'m just broken."',
  },
]

export const distortionById = (id: string) => DISTORTIONS.find((d) => d.id === id)

export const distortionName = (id: string) => distortionById(id)?.name ?? id

/** Practice scenarios for the codex. `accepted` lists every reasonable answer; `best` is the primary one. */
export const SPOTTER_SCENARIOS = [
  {
    thought: '"My manager didn\'t say hello this morning. She must be unhappy with my work and planning to move me off the team."',
    options: ['mind_reading', 'labeling', 'should_statements', 'fortune_telling'],
    accepted: ['mind_reading', 'fortune_telling'],
    best: 'mind_reading',
    explanation:
      'You are assuming what she thinks (mind reading) and then predicting a bad outcome from it (fortune telling). A missed hello has many explanations.',
  },
  {
    thought: '"I missed my morning workout, so this whole week is ruined. No point eating well either."',
    options: ['personalization', 'all_or_nothing', 'mind_reading', 'emotional_reasoning'],
    accepted: ['all_or_nothing'],
    best: 'all_or_nothing',
    explanation: 'One missed session is being treated as total failure. Most weeks are a mix, and a mix still counts.',
  },
  {
    thought: '"I feel so nervous about this presentation. That must mean I\'m going to freeze and embarrass myself."',
    options: ['emotional_reasoning', 'discounting_positive', 'labeling', 'fortune_telling'],
    accepted: ['emotional_reasoning', 'fortune_telling'],
    best: 'emotional_reasoning',
    explanation:
      'Nerves are being read as evidence of the outcome. Feeling nervous before speaking is common, including for people who speak well.',
  },
  {
    thought: '"My friend cancelled dinner. I must have done something to upset her."',
    options: ['overgeneralization', 'personalization', 'should_statements', 'mental_filter'],
    accepted: ['personalization', 'mind_reading'],
    best: 'personalization',
    explanation: 'You are taking responsibility for her choice. People cancel for all kinds of reasons that have nothing to do with you.',
  },
  {
    thought: '"I got a good review, but they probably just felt sorry for me."',
    options: ['catastrophizing', 'discounting_positive', 'labeling', 'all_or_nothing'],
    accepted: ['discounting_positive', 'mind_reading'],
    best: 'discounting_positive',
    explanation: 'A real positive is being explained away so it does not count. If a friend got this review, you would believe it.',
  },
]
