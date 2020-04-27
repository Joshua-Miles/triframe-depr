import { EventEmitter } from 'triframe/core'

export class ConnectionBase extends EventEmitter {

    constructor() {
        super()

        this.timeLastSent = 0
        this.timeLastReceived = 0

        this.inboxId = 0
        this.outboxId = 0
        this.outbox = {}
        this.inbox = {}
        this.receipts = []

        this.clearReceiptsTimer = setInterval(this.clearReceipts, 10000)
    }

    bind(socket) {
        this.socket = socket
        socket.addEventListener('message', this.handleMessage)
        this.on('__request_message__', this.resendMessage)
    }

    emit(event, payload, callback) {
        let id = ++this.outboxId
        let message = JSON.stringify([event, payload, id, ...this.getReceipts()])
        this.saveToOutbox(id, message)
        this.socket.send(message)
        this.timeLastSent = Date.now()
        if (callback) this.on(`__response_${id}__`, callback)
    }

    handleMessage = ({ data }) => {
        try {
            const [event, payload, id, ...receipts] = JSON.parse(data)
            this.timeLastReceived = Date.now()
            const nextMessageId = this.inboxId + 1
            const respond = this.createRespond(id)
            receipts.forEach(this.removeFromOutbox)
            if (parseInt(id) === nextMessageId) {
                this.receipts.push(id)
                this.inboxId = id;
                super.emit(event, payload, respond)
                this.resolveInbox()
            } else if (id !== undefined && id !== null) {
                this.receipts.push(id)
                this.saveToInbox(id, event, payload)
                this.requestMessage(nextMessageId)
            } else {
                super.emit(event, payload, respond)
            }
        } catch {
            console.log('Un-parsed message:', data)
        }
    }

    requestMessage(id) {
        this.socket.send(JSON.stringify(["__request_message__", id]))
    }

    resendMessage = (id) => {
        let message = this.outbox[id]
        this.socket.send(message)
    }

    saveToInbox(id, event, payload) {
        this.inbox[id] = [event, payload]
    }

    removeFromInbox = (id) => {
        delete this.inbox[id]
    }

    saveToOutbox(id, message) {
        this.outbox[id] = message
    }

    removeFromOutbox = (id) => {
        delete this.outbox[id]
    }

    resolveInbox() {
        while (this.inbox[this.inboxId + 1] !== undefined) {
            let [event, payload] = this.inbox[++this.inboxId]
            let respond = this.createRespond(this.inboxId)
            super.emit(event, payload, respond)
            this.removeFromInbox(this.inboxId)
        }
        if (!isEmpty(this.inbox)) {
            this.requestMessage(this.inboxId + 1)
        }
    }

    getReceipts() {
        let result = this.receipts
        this.receipts = []
        return result
    }

    createRespond(id) {
        return (payload, callback) => this.emit(`__response_${id}__`, payload, callback)
    }

    clearReceipts = () => {
        if (this.timeLastSent < (Date.now() - 10000) && this.receipts.length > 0) {
            this.socket.send(JSON.stringify(["__ping__", null, null, ...this.getReceipts()]))
        }
    }

}

const isEmpty = obj => Object.keys(obj).length === 0