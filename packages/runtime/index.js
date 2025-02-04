export const docs = [
  {
    content:
      "\nAWS Amplify is a set of tools and services that can be used together or on their own, to help front-end web and mobile developers build scalable fullstack applications, powered by AWS. Amplify includes a JavaScript library with UI components for React, Angular, Ionic, and Vue.js, as well as a CLI toolchain for managing your app's infrastructure.\n\n### AWS Amplify CLI\n",
    frontmatter: { title: "AWS" },
    slug: "aws",
    path: "aws.md",
    title: "aws",
    breadcrumbs: [{ name: "aws", slug: "aws" }],
    headings: [
      {
        id: "aws-amplify-cli",
        text: "AWS Amplify CLI",
        level: 3,
        slug: "#aws-amplify-cli",
      },
    ],
  },
  {
    content:
      '\n# Hello, Docsmith!\n\n```ts\nimport { Docsmith } from "docsmith";\n```\n',
    frontmatter: { title: "Getting Started with Docsmith" },
    slug: "getting-started",
    path: "getting-started.md",
    title: "getting-started",
    breadcrumbs: [{ name: "getting-started", slug: "getting-started" }],
    headings: [
      {
        id: "hello-docsmith",
        text: "Hello, Docsmith!",
        level: 1,
        slug: "#hello-docsmith",
      },
    ],
  },
  {
    content:
      '\n# This is a tutorial\n\nHello world, to start with the tutorial, you need to have a basic understanding of the following:\n\n- [x] Basic understanding of the command line\n- [ ] Basic understanding of the git command line\n- [x] Basic understanding of the markdown language\n\n## This is the first section\n\nhellow orld, how ya doing\n\n### subsection with note\n\nTHIS IS ANOTEEEE\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\n# Big headings\n\nhello\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.\n\n### FINAL HEADING\n\nThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.\n',
    frontmatter: { title: "Tutorial" },
    slug: "tutorial",
    path: "tutorial.md",
    title: "tutorial",
    breadcrumbs: [{ name: "tutorial", slug: "tutorial" }],
    headings: [
      {
        id: "this-is-a-tutorial",
        text: "This is a tutorial",
        level: 1,
        slug: "#this-is-a-tutorial",
      },
      {
        id: "this-is-the-first-section",
        text: "This is the first section",
        level: 2,
        slug: "#this-is-the-first-section",
      },
      {
        id: "subsection-with-note",
        text: "subsection with note",
        level: 3,
        slug: "#subsection-with-note",
      },
      {
        id: "big-headings",
        text: "Big headings",
        level: 1,
        slug: "#big-headings",
      },
      {
        id: "final-heading",
        text: "FINAL HEADING",
        level: 3,
        slug: "#final-heading",
      },
    ],
  },
];
export const tree = [
  {
    type: "doc",
    name: "aws",
    slug: "aws",
    frontmatter: { title: "AWS" },
    label: "AWS",
    breadcrumbs: [{ name: "aws", slug: "aws" }],
  },
  {
    type: "doc",
    name: "getting-started",
    slug: "getting-started",
    frontmatter: { title: "Getting Started with Docsmith" },
    label: "Getting Started with Docsmith",
    breadcrumbs: [{ name: "getting-started", slug: "getting-started" }],
  },
  {
    type: "doc",
    name: "tutorial",
    slug: "tutorial",
    frontmatter: { title: "Tutorial" },
    label: "Tutorial",
    breadcrumbs: [{ name: "tutorial", slug: "tutorial" }],
  },
];

export function getDoc(slug) {
  return docs.find((doc) => doc.slug === slug) ?? null;
}

export function getTree() {
  return tree;
}

export function getDocs() {
  return docs;
}
