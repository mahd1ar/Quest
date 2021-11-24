# backend routes/endpoints

## these are invokable endpoints

| route              | payload               | defaultVal | description                                                                        |
| ------------------ | --------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `fetch_all_musics` | libraries : string[ ] | [ ]        | backend will scan provided libraries from musics and returns array of Music object |
| `delete_music`     | id : string           | \*         | this id will be erased from the local database                                     |
