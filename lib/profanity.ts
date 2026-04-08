import { Filter } from 'bad-words'

const filter = new Filter()

const filipinoWords = [
  'gago', 'gaga', 'tangina', 'putang', 'puta',
  'bobo', 'ulol', 'tanga', 'leche', 'bwisit',
  'kupal', 'tarantado', 'tarantada', 'hinayupak',
  'kantot', 'pakyu', 'yawa', 'lintik', 'putangina',
  'punyeta', 'hudas', 'burikat', 'salot', 'peste',
  'inamo', 'inamo', 'kingina', 'kingine', 'kingsina',
]

filter.addWords(...filipinoWords)

export function cleanText(text: string): string {
  try {
    return filter.clean(text)
  } catch {
    return text
  }
}