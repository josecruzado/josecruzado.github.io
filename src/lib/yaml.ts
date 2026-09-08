/**
 * Serializador YAML mínimo con resaltado de sintaxis, ambos en tiempo de build.
 *
 * Existe para renderizar el contrato OpenAPI en la web sin arrastrar `js-yaml`
 * ni un resaltador como Shiki o Prism. Dos motivos, y ninguno es la vanidad de
 * no usar dependencias:
 *
 *   · El CSP no admite `unsafe-inline` en style-src, y Shiki resalta con
 *     estilos inline. Por eso el propio Astro avisa de la incompatibilidad.
 *   · Todo ocurre en build: el cliente recibe HTML ya tokenizado y ni un byte
 *     de JavaScript de resaltado.
 *
 * No pretende cubrir YAML entero — solo el subconjunto que produce un
 * documento OpenAPI: mapas, secuencias, escalares y bloques plegados.
 */

type Yaml = string | number | boolean | null | readonly Yaml[] | { readonly [k: string]: Yaml };

const PLAIN_KEY = /^[A-Za-z_$][\w$-]*$/;
/** Cadenas que YAML leería como otra cosa si no van entre comillas. */
const AMBIGUOUS = /^(-?\d+(\.\d+)?|true|false|null|yes|no|on|off|~)$/i;
const NEEDS_QUOTES = /[:#'"\n]|^\s|\s$|^$|^[-?&*!|>%@`]/;

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

function scalar(value: string): string {
  return NEEDS_QUOTES.test(value) || AMBIGUOUS.test(value) ? quote(value) : value;
}

/** Parte un texto largo en líneas de ~64 caracteres sin cortar palabras. */
function wrap(text: string, width = 64): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    if (current && `${current} ${word}`.length > width) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function toYaml(value: Yaml, indent = 0): string {
  const pad = '  '.repeat(indent);

  if (value === null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);

  if (typeof value === 'string') {
    // Los textos largos van como bloque plegado: es lo que se escribiría a
    // mano en un OpenAPI real y evita una línea con scroll horizontal.
    if (value.length > 72 && !NEEDS_QUOTES.test(value)) {
      return `>-\n${wrap(value)
        .map((line) => `${pad}  ${line}`)
        .join('\n')}`;
    }
    return scalar(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        const rendered = toYaml(item, indent + 1);
        // Un objeto dentro de una secuencia cuelga del guion.
        return typeof item === 'object' && item !== null
          ? `${pad}- ${rendered.trimStart()}`
          : `${pad}- ${rendered}`;
      })
      .join('\n');
  }

  const entries = Object.entries(value as Record<string, Yaml>);
  if (entries.length === 0) return '{}';

  return entries
    .map(([key, item]) => {
      const name = PLAIN_KEY.test(key) ? key : quote(key);
      if (item !== null && typeof item === 'object') {
        const isEmpty = Array.isArray(item) ? item.length === 0 : Object.keys(item).length === 0;
        if (isEmpty) return `${pad}${name}: ${Array.isArray(item) ? '[]' : '{}'}`;
        return `${pad}${name}:\n${toYaml(item, indent + 1)}`;
      }
      return `${pad}${name}: ${toYaml(item, indent)}`;
    })
    .join('\n');
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Localiza el rango de líneas de cada `path` dentro del YAML ya serializado.
 *
 * Permite que la vista del contrato resalte en el panel izquierdo las líneas
 * del endpoint sobre el que está el cursor. Se calcula en build recorriendo
 * la salida, no parseando de nuevo: el serializador es determinista, así que
 * basta con encontrar las claves bajo `paths:` y ver dónde acaba cada una.
 */
export function pathLineRanges(source: string): Record<string, [number, number]> {
  const lines = source.split('\n');
  const ranges: Record<string, [number, number]> = {};
  const starts: Array<{ path: string; line: number }> = [];

  let insidePaths = false;
  lines.forEach((line, index) => {
    if (/^paths:\s*$/.test(line)) {
      insidePaths = true;
      return;
    }
    if (insidePaths && /^\S/.test(line)) insidePaths = false;
    if (!insidePaths) return;
    const key = line.match(/^ {2}'?(\/[^':]*)'?:\s*$/);
    if (key) starts.push({ path: key[1], line: index });
  });

  starts.forEach((entry, i) => {
    const next = starts[i + 1];
    let end = next ? next.line - 1 : lines.length - 1;
    if (!next) {
      // Último path: acaba donde reaparece una clave de primer nivel.
      for (let i = entry.line + 1; i < lines.length; i += 1) {
        if (/^\S/.test(lines[i])) {
          end = i - 1;
          break;
        }
      }
    }
    ranges[entry.path] = [entry.line, end];
  });

  return ranges;
}

/**
 * Envuelve cada token en un `<span>` con su clase, y cada línea en un
 * `<span class="line" data-line="N">` para poder direccionarlas desde la
 * vista del contrato. El coloreado lo deciden los tokens de CSS, de modo
 * que el resaltado respeta el tema.
 *
 * Las líneas se emiten sin `\n` entre ellas: son `display: block`, así el
 * resaltado ocupa el ancho completo y el copiado conserva los saltos.
 */
export function highlightYaml(source: string): string {
  return source
    .split('\n')
    .map((line, index) => `<span class="line" data-line="${index}">${token(line)}</span>`)
    .join('');
}

function token(line: string): string {
  return [line]
    .map((line) => {
      const entry = line.match(/^(\s*)(- )?([A-Za-z_$'][^:]*?)(:)(\s*)(.*)$/);
      if (entry) {
        const [, space, dash, key, colon, gap, rest] = entry;
        return (
          escapeHtml(space) +
          (dash ? `<span class="tok-punct">${escapeHtml(dash)}</span>` : '') +
          `<span class="tok-key">${escapeHtml(key)}</span>` +
          `<span class="tok-punct">${colon}</span>` +
          escapeHtml(gap) +
          value(rest)
        );
      }
      const item = line.match(/^(\s*)(- )(.*)$/);
      if (item) {
        const [, space, dash, rest] = item;
        return (
          escapeHtml(space) + `<span class="tok-punct">${escapeHtml(dash)}</span>` + value(rest)
        );
      }
      return value(line, true);
    })
    .join('');
}

function value(raw: string, keepIndent = false): string {
  if (!raw.trim()) return escapeHtml(raw);
  const leading = keepIndent ? (raw.match(/^\s*/)?.[0] ?? '') : '';
  const body = keepIndent ? raw.slice(leading.length) : raw;

  let cls = 'tok-text';
  if (/^'.*'$/.test(body) || /^".*"$/.test(body)) cls = 'tok-string';
  else if (/^-?\d+(\.\d+)?$/.test(body)) cls = 'tok-number';
  else if (/^(true|false|null)$/.test(body)) cls = 'tok-bool';
  else if (/^[[\]{}>|]/.test(body)) cls = 'tok-punct';

  return escapeHtml(leading) + `<span class="${cls}">${escapeHtml(body)}</span>`;
}
