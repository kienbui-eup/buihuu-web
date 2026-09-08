/*
Vai vế xưng hô trong họ, tính theo đời.

Câu hỏi hay gặp nhất khi con cháu gặp nhau hay tra phả là "tôi phải gọi người
này là gì". Trong một dòng họ một chi phái, mọi người cùng một thủy tổ, nên
chênh lệch số đời (tính từ thủy tổ) chính là chênh lệch vai: ai đời nhỏ hơn là
bậc trên, ai đời lớn hơn là bậc dưới, không kể tuổi tác. Đây là lối tính vai
người Việt vẫn dùng ("con anh cả tuy ít tuổi vẫn là vai trên").

Giới hạn: phả chưa chép thứ tự sinh trong từng đời, nên không phân được bác với
chú, hay anh với em cùng vai. Ở đây chỉ nói vai theo đời và, khi biết giới tính,
chọn được ông/bà, cô/chú. Hàm trả về dữ liệu có cấu trúc; phần chữ do giao diện
ghép, để đổi lời không phải sửa logic.
*/

const GENDER_MALE = 1
const GENDER_FEMALE = 0

// Lấy số đời từ giá trị thuộc tính "Đời" (ví dụ "12", "Đời 12", "12 (dòng
// trưởng)"). Không có số thì trả về null.
export function parseDoi(value) {
  const match = String(value ?? '').match(/\d+/)
  return match ? Number(match[0]) : null
}

// Cách người dưới gọi người trên, theo số đời cách nhau và giới tính người trên.
function upTerm(level, gender) {
  if (level === 1) {
    if (gender === GENDER_MALE) return 'chú hoặc bác'
    if (gender === GENDER_FEMALE) return 'cô hoặc bác'
    return 'chú, bác hoặc cô'
  }
  if (level === 2) {
    if (gender === GENDER_MALE) return 'ông'
    if (gender === GENDER_FEMALE) return 'bà'
    return 'ông hoặc bà'
  }
  if (level === 3) return 'cụ'
  if (level === 4) return 'kỵ'
  return `bậc trên ${level} đời`
}

// Cách người trên gọi người dưới. Trong họ, người bậc trên gọi mọi người bậc
// dưới là "cháu" bất kể cách mấy đời; bậc cụ thể (cụ, chắt) chỉ dùng khi tính
// dòng dõi thẳng, không dùng cho vai bàng hệ. Số đời cách nhau đã nói trong câu.
// eslint-disable-next-line no-unused-vars
function downTerm(level) {
  return 'cháu'
}

/*
Vai vế của "người kia" so với "người mốc" (bạn).

  doiSelf, doiOther  số đời của bạn và của người kia (từ parseDoi); null là
                     chưa biết.
  genderSelf,        0 nữ, 1 nam, giá trị khác coi như chưa rõ.
  genderOther
  sameHandle         true nếu người kia chính là người mốc.

Trả về một trong:
  {kind: 'self'}
  {kind: 'unknown'}                            thiếu đời của một trong hai bên
  {kind: 'rel', direction, level, vai,         quan hệ tính được
   youCall, theyCall, uncertain}
direction: 'same' | 'up' (người kia bậc trên) | 'down' (người kia bậc dưới).
youCall  bạn gọi người kia là gì; theyCall người kia gọi bạn là gì.
uncertain true khi không phân được bác/chú (cách 1 đời) hay anh/em (ngang vai).
*/
export function vaiVe({
  doiSelf,
  doiOther,
  genderSelf,
  genderOther,
  sameHandle = false,
} = {}) {
  if (sameHandle) return {kind: 'self'}
  if (doiSelf == null || doiOther == null) return {kind: 'unknown'}

  const diff = doiOther - doiSelf
  if (diff === 0) {
    return {
      kind: 'rel',
      direction: 'same',
      level: 0,
      vai: 'Ngang vai',
      youCall: 'anh, chị hoặc em',
      theyCall: 'anh, chị hoặc em',
      uncertain: true,
    }
  }
  if (diff < 0) {
    const level = -diff
    return {
      kind: 'rel',
      direction: 'up',
      level,
      vai: `Trên bạn ${level} đời`,
      youCall: upTerm(level, genderOther),
      theyCall: downTerm(level),
      uncertain: level === 1,
    }
  }
  const level = diff
  return {
    kind: 'rel',
    direction: 'down',
    level,
    vai: `Dưới bạn ${level} đời`,
    youCall: downTerm(level),
    theyCall: upTerm(level, genderSelf),
    uncertain: level === 1,
  }
}
