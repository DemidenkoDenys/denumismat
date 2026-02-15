export const encrypt = (data: any) => String(data).split('').map((c, i) => (c.charCodeAt(0) + 147 + i).toString(36).padStart(3, '0')).reverse().join('').toUpperCase();
export const decrypt = (str: string) => str.toLowerCase().match(/.{1,3}/g)?.reverse().map((chunk, i) => String.fromCharCode(parseInt(chunk, 36) - 147 - i)).join('');
