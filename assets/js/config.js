export const COMMON = {
    ipaddress: await fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(data => data.ip)
                .catch(() => 'Unknown')
};