---
"@alauda/doom": patch
---

Stop a sentence's own punctuation from being read as part of a URL.

`translation-url-residue` matched `\S+` after a scheme — everything up to the
next space. Two things follow from that, and both were wrong.

A scheme with nothing after it became a URL. `(https://)` yielded `https://)`,
so a line of English prose naming a protocol was treated as an address the
translation had to reproduce byte for byte. And Chinese does not write spaces,
so on the translation side the match ran on past the address and took the rest
of the sentence with it: `（https://）和路径` yielded `https://）和路径`, which
could not equal anything the English side produced no matter how faithful the
translation was.

Measured on a real build: `connectors-operator` release-1.14 was red on every
docs build for 22 hours — 9 runs — on one line that reads `includes the correct
protocol (https://) and path`. Nothing had been lost; the Chinese said the same
thing with full-width brackets. The rule's own note said a check that misfires
"costs one finding to read", and that turned out to be the wrong price: this
rule reports against the whole page, so the assembled document could not
attribute the finding to any segment and failed outright, with no repair round
and the whole page as the blast radius.

Three changes, from cause to backstop:

- a URL now ends at the first character a URL cannot contain — printable ASCII
  is what a URL is made of — instead of at the next space, so the two languages
  agree about where it ends. An internationalised host written out in prose
  (`https://例え.jp`) is no longer detected, which is the right trade: a
  detector that cannot agree with its own translation is not a detector;
- trailing punctuation comes off the end the way GFM's autolink extension takes
  it off, and a closing bracket comes off only when the URL did not open it —
  so `ftp://h/Foo_(disambiguation)` keeps its parenthesis and `(see ftp://h/x)`
  does not;
- a scheme with no host is not a URL. An address that cannot be fetched cannot
  be a link a translation has to carry through.

And the backstop, which is the part that outlives this particular misfire:
`translation-url-residue` is now also checked per segment, during acceptance,
the way `translation-heading-sequence`, `translation-component-multiset` and
`no-unparsed-emphasis` already are. A whole-document finding names a defect but
not a place, and the pipeline rightly refuses to route one by line number — so
until now a finding from this rule had no segment to be sent back to and could
only fail the document. Checked per segment it arrives with the segment
attached, gets three attempts and a repair agent, and the whole-page rule goes
back to meaning what its note says it means: if it fires after every segment
passed the same comparison, assembly did it.

Worth writing down for whoever meets this next: eight of the ten
`translation-*` rules still have no per-segment mirror, and every one of them
reports against the document root. Any of them that fires at assembly time
fails the page the same way this one did.
