import type { Editor } from '@tiptap/react'

/**
 * Convert Tiptap JSON to Markdown
 */
export function getMarkdownFromEditor(editor: Editor): string {
  const json = editor.getJSON()
  const markdown = jsonToMarkdown(json)
  // Trim the result to handle empty content properly
  return markdown.trim()
}

/**
 * Convert JSON to Markdown recursively
 * @param node - The node to convert
 * @param listLevel - Current nesting level for lists
 * @param parentListType - Type of parent list ('bulletList' | 'orderedList' | 'taskList' | null)
 * @param orderedListIndex - Current index for ordered lists (resets per list)
 */
function jsonToMarkdown(
  node: any,
  listLevel = 0,
  parentListType: 'bulletList' | 'orderedList' | 'taskList' | null = null,
  orderedListIndex = 1
): string {
  if (!node) return ''

  // Handle text nodes
  if (node.type === 'text') {
    let text = node.text || ''

    // Apply marks
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            text = `**${text}**`
            break
          case 'italic':
            text = `*${text}*`
            break
          case 'strike':
            text = `~~${text}~~`
            break
          case 'link':
            text = `[${text}](${mark.attrs?.href || ''})`
            break
          case 'code':
            text = `\`${text}\``
            break
        }
      }
    }

    return text
  }

  // Handle content array
  let result = ''
  const content = node.content || []

  switch (node.type) {
    case 'doc':
      result = content
        .map((child: any) => jsonToMarkdown(child, 0, null, 1))
        .join('\n\n')
      break

    case 'paragraph':
      result = content
        .map((child: any) =>
          jsonToMarkdown(child, listLevel, parentListType, orderedListIndex)
        )
        .join('')
      break

    case 'heading': {
      const level = node.attrs?.level || 1
      const headingText = content
        .map((child: any) =>
          jsonToMarkdown(child, listLevel, parentListType, orderedListIndex)
        )
        .join('')
        .trim()
      // Skip empty headings (headings with no content or only whitespace)
      if (headingText === '') {
        result = ''
        break
      }
      result = `${'#'.repeat(level)} ${headingText}`
      break
    }

    case 'bulletList': {
      // Process each list item, tracking that we're in a bullet list
      const items: string[] = []
      content.forEach((child: any) => {
        items.push(jsonToMarkdown(child, listLevel, 'bulletList', 1))
      })
      result = items.join('\n')
      break
    }

    case 'orderedList': {
      // Process each list item, tracking that we're in an ordered list
      const items: string[] = []
      let currentIndex = 1
      content.forEach((child: any) => {
        items.push(
          jsonToMarkdown(child, listLevel, 'orderedList', currentIndex)
        )
        currentIndex++
      })
      result = items.join('\n')
      break
    }

    case 'listItem': {
      // Determine the marker based on parent list type
      let marker: string
      if (parentListType === 'orderedList') {
        marker = `${orderedListIndex}. `
      } else {
        // Default to bullet list marker
        marker = '- '
      }

      // Process item content
      const paragraphTexts: string[] = []
      const nestedLists: string[] = []

      content.forEach((child: any) => {
        if (child.type === 'paragraph') {
          const text =
            child.content
              ?.map((c: any) =>
                jsonToMarkdown(c, listLevel, parentListType, orderedListIndex)
              )
              .join('') || ''
          if (text.trim()) {
            paragraphTexts.push(text)
          }
        } else if (child.type === 'bulletList') {
          // Nested bullet list - indent each line by 2 spaces
          const nestedList = jsonToMarkdown(
            child,
            listLevel + 1,
            'bulletList',
            1
          )
          if (nestedList.trim()) {
            // Indent each line of the nested list
            const indentedNested = nestedList
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n')
            nestedLists.push(indentedNested)
          }
        } else if (child.type === 'orderedList') {
          // Nested ordered list - indent each line by 2 spaces
          const nestedList = jsonToMarkdown(
            child,
            listLevel + 1,
            'orderedList',
            1
          )
          if (nestedList.trim()) {
            // Indent each line of the nested list
            const indentedNested = nestedList
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n')
            nestedLists.push(indentedNested)
          }
        } else if (child.type === 'taskList') {
          // Nested task list - indent each line by 2 spaces
          const nestedList = jsonToMarkdown(child, listLevel + 1, 'taskList', 1)
          if (nestedList.trim()) {
            // Indent each line of the nested list
            const indentedNested = nestedList
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n')
            nestedLists.push(indentedNested)
          }
        } else {
          const childText = jsonToMarkdown(
            child,
            listLevel,
            parentListType,
            orderedListIndex
          )
          if (childText.trim()) {
            paragraphTexts.push(childText)
          }
        }
      })

      // Combine paragraph text
      const itemText = paragraphTexts.join(' ')

      // Build result: marker + text + nested lists (each on new line, indented)
      if (nestedLists.length > 0) {
        const nestedContent = nestedLists.join('\n')
        result = `${marker}${itemText}\n${nestedContent}`
      } else {
        result = `${marker}${itemText}`
      }
      break
    }

    case 'taskList': {
      // Process each task item, tracking that we're in a task list
      const items: string[] = []
      content.forEach((child: any) => {
        items.push(jsonToMarkdown(child, listLevel, 'taskList', 1))
      })
      result = items.join('\n')
      break
    }

    case 'taskItem': {
      const checked = node.attrs?.checked ? 'x' : ' '

      // Process item content
      const paragraphTexts: string[] = []
      const nestedLists: string[] = []

      content.forEach((child: any) => {
        if (child.type === 'paragraph') {
          const text =
            child.content
              ?.map((c: any) =>
                jsonToMarkdown(c, listLevel, parentListType, orderedListIndex)
              )
              .join('') || ''
          if (text.trim()) {
            paragraphTexts.push(text)
          }
        } else if (child.type === 'bulletList') {
          // Nested bullet list - indent each line by 2 spaces
          const nestedList = jsonToMarkdown(
            child,
            listLevel + 1,
            'bulletList',
            1
          )
          if (nestedList.trim()) {
            const indentedNested = nestedList
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n')
            nestedLists.push(indentedNested)
          }
        } else if (child.type === 'orderedList') {
          // Nested ordered list - indent each line by 2 spaces
          const nestedList = jsonToMarkdown(
            child,
            listLevel + 1,
            'orderedList',
            1
          )
          if (nestedList.trim()) {
            const indentedNested = nestedList
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n')
            nestedLists.push(indentedNested)
          }
        } else if (child.type === 'taskList') {
          // Nested task list - indent each line by 2 spaces
          const nestedList = jsonToMarkdown(child, listLevel + 1, 'taskList', 1)
          if (nestedList.trim()) {
            const indentedNested = nestedList
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n')
            nestedLists.push(indentedNested)
          }
        } else {
          const childText = jsonToMarkdown(
            child,
            listLevel,
            parentListType,
            orderedListIndex
          )
          if (childText.trim()) {
            paragraphTexts.push(childText)
          }
        }
      })

      // Combine paragraph text
      const taskText = paragraphTexts.join(' ')

      // Build result: checkbox + text + nested lists (each on new line, indented)
      if (nestedLists.length > 0) {
        const nestedContent = nestedLists.join('\n')
        result = `- [${checked}] ${taskText}\n${nestedContent}`
      } else {
        result = `- [${checked}] ${taskText}`
      }
      break
    }

    case 'codeBlock': {
      const code = content
        .map((child: any) =>
          jsonToMarkdown(child, listLevel, parentListType, orderedListIndex)
        )
        .join('')
      result = `\`\`\`\n${code}\n\`\`\``
      break
    }

    case 'blockquote': {
      const quote = content
        .map((child: any) =>
          jsonToMarkdown(child, listLevel, parentListType, orderedListIndex)
        )
        .join('\n')
      result = quote
        .split('\n')
        .map((line: string) => `> ${line}`)
        .join('\n')
      break
    }

    case 'hardBreak':
      result = '  \n'
      break

    case 'horizontalRule':
      result = '---'
      break

    default:
      result = content
        .map((child: any) =>
          jsonToMarkdown(child, listLevel, parentListType, orderedListIndex)
        )
        .join('')
  }

  return result
}

/**
 * Remove empty headings and their adjacent empty lines from markdown
 * This preprocesses the markdown to remove patterns like: \n\n## \n\n
 */
function removeEmptyHeadings(markdown: string): string {
  const lines = markdown.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Check if this is an empty heading (only # and optional spaces, no text after)
    // Match patterns like: ##, ## , ###, etc. (but not ## texto)
    const headingMatch = trimmed.match(/^#{1,6}\s*$/)

    // Also check explicitly: if it starts with #, remove all # and spaces, and see if anything remains
    const isHeading = trimmed.match(/^#{1,6}\s/)
    const isEmptyHeading =
      isHeading && trimmed.replace(/^#+\s*/, '').trim() === ''

    if (headingMatch || isEmptyHeading) {
      // This is an empty heading - remove it and empty lines after it
      // DO NOT remove empty lines before it - those are valid spacing

      // Skip the empty heading itself
      i++

      // Skip all empty lines immediately after the empty heading
      while (i < lines.length && lines[i].trim() === '') {
        i++
      }

      continue
    }

    result.push(line)
    i++
  }

  return result.join('\n')
}

/**
 * Parse Markdown to HTML for Tiptap
 * This is a simple parser for basic markdown features
 * Supports nested lists with proper indentation handling
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown || markdown.trim() === '') return '<p></p>'

  // Normalize line endings and multiple newlines
  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Note: We don't pre-process to remove empty headings here because it can affect spacing.
  // Instead, we handle empty headings during parsing to preserve spacing structure.

  // Split into lines for processing
  const lines = normalized.split('\n')

  // Process lines to build HTML
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Handle empty lines - preserve them as spacing elements
    if (trimmed === '') {
      // Count consecutive empty lines
      let emptyLineCount = 0
      let j = i
      while (j < lines.length && lines[j].trim() === '') {
        emptyLineCount++
        j++
      }

      // Check if next content is a heading (with or without space after #)
      const nextLine = j < lines.length ? lines[j].trim() : ''
      const nextIsHeading = nextLine.match(/^#{1,6}(\s|$)/)

      // Check if the heading is empty (only # with optional spaces, no text)
      let nextIsEmptyHeading = false
      if (nextIsHeading) {
        // Remove all # and any spaces after them
        const headingText = nextLine.replace(/^#+\s*/, '').trim()
        nextIsEmptyHeading = headingText === ''
      }

      // If next is an empty heading, process empty lines normally (preserve spacing)
      // but then skip the empty heading and empty lines after it
      // Also handle multiple consecutive empty headings
      if (nextIsEmptyHeading) {
        // Process empty lines normally to preserve spacing
        const paragraphsToAdd =
          emptyLineCount >= 1 ? emptyLineCount : emptyLineCount - 1
        for (let k = 0; k < paragraphsToAdd; k++) {
          blocks.push('<h2></h2>')
        }

        // Skip the empty heading
        j++

        // Skip empty lines after the empty heading
        while (j < lines.length && lines[j].trim() === '') {
          j++
        }

        // Check if there are more consecutive empty headings and skip them too
        while (j < lines.length) {
          const checkLine = lines[j].trim()
          const checkIsHeading = checkLine.match(/^#{1,6}(\s|$)/)
          if (checkIsHeading) {
            const checkHeadingText = checkLine.replace(/^#+\s*/, '').trim()
            if (checkHeadingText === '') {
              // Another empty heading, skip it
              j++
              // Skip empty lines after this empty heading too
              while (j < lines.length && lines[j].trim() === '') {
                j++
              }
              continue
            }
          }
          break
        }

        i = j
        continue
      }

      // For headings: add (emptyLineCount - 1) empty paragraphs
      // For other blocks: add (emptyLineCount - 1) empty paragraphs
      // This is because the natural spacing between blocks (margin-top: 0.75em) already provides one "gap"
      // But we need at least one empty paragraph for \n\n before headings to show spacing
      if (j < lines.length) {
        const paragraphsToAdd =
          nextIsHeading && emptyLineCount >= 1
            ? emptyLineCount
            : emptyLineCount - 1
        for (let k = 0; k < paragraphsToAdd; k++) {
          blocks.push('<h2></h2>')
        }
      }

      i = j
      continue
    }

    // Headings (with or without space after #)
    if (trimmed.match(/^#{1,6}(\s|$)/)) {
      const level = trimmed.match(/^#+/)?.[0].length || 1
      // Remove all # and any spaces after them
      const text = trimmed.replace(/^#+\s*/, '').trim()
      // Skip empty headings (headings with no content or only whitespace)
      if (text === '') {
        // Skip this empty heading
        i++
        // Skip any empty lines after it
        while (i < lines.length && lines[i].trim() === '') {
          i++
        }
        // Check if there are more consecutive empty headings and skip them too
        while (i < lines.length) {
          const checkLine = lines[i].trim()
          const checkIsHeading = checkLine.match(/^#{1,6}(\s|$)/)
          if (checkIsHeading) {
            const checkHeadingText = checkLine.replace(/^#+\s*/, '').trim()
            if (checkHeadingText === '') {
              // Another empty heading, skip it
              i++
              // Skip empty lines after this empty heading too
              while (i < lines.length && lines[i].trim() === '') {
                i++
              }
              continue
            }
          }
          break
        }
        continue
      }
      blocks.push(`<h${level}>${parseInlineMarkdown(text, false)}</h${level}>`)
      i++
      continue
    }

    // Code blocks
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = []
      i++ // Skip opening ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++ // Skip closing ```
      const code = codeLines.join('\n')
      blocks.push(`<pre><code>${escapeHtml(code)}</code></pre>`)
      continue
    }

    // Horizontal rule
    if (trimmed === '---') {
      blocks.push('<hr>')
      i++
      continue
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      const text = quoteLines.join('\n')
      blocks.push(
        `<blockquote><p>${parseInlineMarkdown(text, true)}</p></blockquote>`
      )
      continue
    }

    // Lists (including nested)
    if (
      trimmed.match(/^[-*]\s/) ||
      trimmed.match(/^\d+\.\s/) ||
      trimmed.match(/^- \[[ x]\]/)
    ) {
      const listHtml = parseList(lines, i)
      blocks.push(listHtml.html)
      i = listHtml.nextIndex
      continue
    }

    // Regular paragraph - collect consecutive non-list lines
    const paragraphLines: string[] = []
    while (i < lines.length) {
      const currentLine = lines[i].trim()
      if (
        currentLine === '' ||
        currentLine.match(/^#{1,6}\s/) ||
        currentLine.startsWith('```') ||
        currentLine === '---' ||
        currentLine.startsWith('>') ||
        currentLine.match(/^[-*]\s/) ||
        currentLine.match(/^\d+\.\s/) ||
        currentLine.match(/^- \[[ x]\]/)
      ) {
        break
      }
      paragraphLines.push(lines[i])
      i++
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.join('\n')
      blocks.push(`<p>${parseInlineMarkdown(paragraphText, true)}</p>`)
    }
  }

  return blocks.join('')
}

/**
 * Parse a list (bullet, ordered, or task) with support for nested lists
 */
function parseList(
  lines: string[],
  startIndex: number,
  baseIndent = 0
): { html: string; nextIndex: number } {
  const items: Array<{
    content: string
    children?: string
    checked?: boolean
  }> = []
  let i = startIndex
  let listType: 'bullet' | 'ordered' | 'task' | null = null
  let currentIndent = baseIndent

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      // Empty line - check if list continues
      let nextNonEmpty = i + 1
      while (nextNonEmpty < lines.length && lines[nextNonEmpty].trim() === '') {
        nextNonEmpty++
      }

      if (nextNonEmpty >= lines.length) break

      const nextLine = lines[nextNonEmpty]
      const nextIndent = nextLine.length - nextLine.trimStart().length
      const nextTrimmed = nextLine.trim()

      // Check if next line is a list item at same or deeper level
      const isListItem =
        nextTrimmed.match(/^[-*]\s/) ||
        nextTrimmed.match(/^\d+\.\s/) ||
        nextTrimmed.match(/^- \[[ x]\]/)

      if (!isListItem || nextIndent < baseIndent) {
        break
      }

      i++
      continue
    }

    const indent = line.length - line.trimStart().length

    // If indent is less than base, we're done with this list
    if (indent < baseIndent) {
      break
    }

    // If indent is greater than base, it's a nested list (handled below)
    // If indent equals base, it's a new item at this level

    // Detect list type
    const bulletMatch = trimmed.match(/^[-*]\s/)
    const orderedMatch = trimmed.match(/^\d+\.\s/)
    const taskMatch = trimmed.match(/^- \[([ x])\]\s/)

    if (!bulletMatch && !orderedMatch && !taskMatch) {
      // Not a list item - might be continuation text
      if (items.length > 0 && indent >= baseIndent) {
        const lastItem = items[items.length - 1]
        lastItem.content += ` ${parseInlineMarkdown(trimmed, false)}`
        i++
        continue
      }
      break
    }

    // Determine list type from first item
    if (listType === null) {
      if (taskMatch) listType = 'task'
      else if (orderedMatch) listType = 'ordered'
      else listType = 'bullet'
      currentIndent = indent
    }

    // If this is a nested list (indent > current), parse it recursively
    if (indent > currentIndent) {
      const nestedList = parseList(lines, i, indent)
      const lastItem = items[items.length - 1]
      if (lastItem) {
        if (!lastItem.children) {
          lastItem.children = nestedList.html
        } else {
          lastItem.children += nestedList.html
        }
      }
      i = nestedList.nextIndex
      continue
    }

    // If indent is less than current, we're done
    if (indent < currentIndent) {
      break
    }

    // Extract item content
    let itemContent = ''
    let checked = false

    if (taskMatch) {
      itemContent = trimmed.replace(/^- \[[ x]\]\s*/, '')
      checked = taskMatch[1] === 'x'
    } else if (orderedMatch) {
      itemContent = trimmed.replace(/^\d+\.\s/, '')
    } else if (bulletMatch) {
      itemContent = trimmed.replace(/^[-*]\s/, '')
    }

    // Look ahead for nested lists or continuation text
    let nestedContent = ''
    let j = i + 1

    while (j < lines.length) {
      const nextLine = lines[j]
      const nextTrimmed = nextLine.trim()
      const nextIndent = nextLine.length - nextLine.trimStart().length

      if (nextTrimmed === '') {
        // Empty line found - check what comes after
        let nextNonEmpty = j + 1
        while (
          nextNonEmpty < lines.length &&
          lines[nextNonEmpty].trim() === ''
        ) {
          nextNonEmpty++
        }

        if (nextNonEmpty >= lines.length) {
          // End of file, stop processing this item
          break
        }

        const afterEmptyLine = lines[nextNonEmpty]
        const afterEmptyTrimmed = afterEmptyLine.trim()
        const afterEmptyIndent =
          afterEmptyLine.length - afterEmptyLine.trimStart().length

        // Check if what comes after the empty line is a list item
        const isListItemAfterEmpty =
          afterEmptyTrimmed.match(/^[-*]\s/) ||
          afterEmptyTrimmed.match(/^\d+\.\s/) ||
          afterEmptyTrimmed.match(/^- \[[ x]\]/)

        // An empty line in markdown typically ends a list item
        // Only continue if the next line is a list item at the same indent level
        // (which would be a continuation of the same list, but a new item)
        // or if it's a nested list item that comes immediately after (no empty line)
        // Since we found an empty line, we should stop processing this item
        // The outer loop will handle what comes next
        break
      }

      // Check if it's a nested list (more indent)
      const isNestedListItem =
        (nextTrimmed.match(/^[-*]\s/) ||
          nextTrimmed.match(/^\d+\.\s/) ||
          nextTrimmed.match(/^- \[[ x]\]/)) &&
        nextIndent > indent

      if (isNestedListItem) {
        const nestedList = parseList(lines, j, nextIndent)
        nestedContent = nestedList.html
        j = nestedList.nextIndex
        break
      }

      // Check if it's continuation text (same indent, not a list marker)
      // Continuation text should come immediately after the item, not after empty lines
      if (
        nextIndent === indent &&
        !nextTrimmed.match(/^[-*]\s/) &&
        !nextTrimmed.match(/^\d+\.\s/) &&
        !nextTrimmed.match(/^- \[[ x]\]/)
      ) {
        itemContent += ` ${parseInlineMarkdown(nextTrimmed, false)}`
        j++
        continue
      }

      // Not part of this item
      break
    }

    items.push({
      content: itemContent,
      children: nestedContent || undefined,
      checked: listType === 'task' ? checked : undefined,
    })

    i = j
  }

  // Build HTML
  const tag = listType === 'task' ? 'ul' : listType === 'ordered' ? 'ol' : 'ul'
  const attributes = listType === 'task' ? ' data-type="taskList"' : ''

  const itemsHtml = items
    .map(item => {
      const itemAttrs =
        listType === 'task'
          ? ` data-type="taskItem" data-checked="${item.checked ? 'true' : 'false'}"`
          : ''

      const itemContentHtml = parseInlineMarkdown(item.content, false)
      const childrenHtml = item.children || ''

      return `<li${itemAttrs}><p>${itemContentHtml}</p>${childrenHtml}</li>`
    })
    .join('')

  return {
    html: `<${tag}${attributes}>${itemsHtml}</${tag}>`,
    nextIndex: i,
  }
}

/**
 * Parse inline markdown (bold, italic, links, etc.)
 * @param text - Text to parse
 * @param convertSingleNewlines - If true, converts single \n to <br>
 */
function parseInlineMarkdown(
  text: string,
  convertSingleNewlines = false
): string {
  let result = text

  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Strikethrough
  result = result.replace(/~~([^~]+)~~/g, '<s>$1</s>')

  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Line breaks
  if (convertSingleNewlines) {
    // Convert all single \n to <br> (since we're already inside a block that was split by \n\n)
    // First handle two spaces + \n (standard markdown line break)
    result = result.replace(/ {2}\n/g, '<br>')
    // Then convert remaining single \n to <br>
    result = result.replace(/\n/g, '<br>')
  } else {
    // Only handle two spaces + \n (standard markdown line break)
    result = result.replace(/ {2}\n/g, '<br>')
  }

  return result
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}
