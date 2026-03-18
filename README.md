# Chronos Client - Claude Code Plugin

追蹤 Claude Code 的使用時間與 token 消耗的 Plugin。

## 安裝

在 Claude Code 中執行：

```
/plugin marketplace add tzangms/chronos-client
```

然後安裝 plugin：

```
/plugin install chronos@tzangms/chronos-client
```

## 設定

安裝後執行 setup 指令來設定 API URL 和 API Key：

```
/chronos:setup
```

## 指令

| 指令 | 說明 |
|------|------|
| `/chronos:setup` | 設定 API URL 和 API Key |
| `/chronos:status` | 檢查連線狀態 |
| `/chronos:stats` | 查看使用統計 |
| `/chronos:stats week` | 查看每週統計 |

## 追蹤內容

Plugin 會自動追蹤：

- **Session 開始/結束** - Claude Code session 的起訖時間
- **Token 用量** - Input、output 和 cache tokens
- **專案資訊** - 目前工作的專案
- **Machine ID** - 匿名的機器識別碼

## 離線支援

伺服器無法連線時，資料會暫存在 `~/.chronos/offline_heartbeats.json`，恢復連線後自動同步。

## 疑難排解

### 連線錯誤

1. 檢查 `~/.chronos/config.json` 的 API URL
2. 確認伺服器正在運行
3. 確認 API Key 正確

### Debug 模式

```bash
export CHRONOS_DEBUG=1
claude
```

## 隱私

- 只傳送使用量的 metadata（tokens、時間戳記、專案名稱）
- 不會傳送任何程式碼內容
- Machine ID 是 hash，不是真實識別碼
- 所有資料都存在你自己的伺服器上
