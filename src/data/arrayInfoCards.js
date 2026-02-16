export const arrayInfoCards = [
  {
    icon: '📦',
    title: 'What is an Array?',
    text: 'A collection of elements stored in contiguous memory locations, each identified by an index starting at zero.',
  },
  {
    icon: '🧠',
    title: 'Memory Model',
    text: 'Elements occupy consecutive memory addresses. Address = base + (index × element_size), enabling instant access.',
  },
  {
    icon: '⚡',
    title: 'When to Use',
    text: 'When you need O(1) random access by index, know the size upfront, or require cache-friendly iteration.',
  },
  {
    icon: '⚠️',
    title: 'Trade-offs',
    text: 'Fixed size (static arrays), costly inserts/deletes in the middle — every shift is O(n). Consider linked lists if frequent mutations are needed.',
  },
];
