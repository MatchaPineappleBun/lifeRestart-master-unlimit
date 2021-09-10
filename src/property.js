import { clone } from './functions/util.js';

class Property {
    constructor() {}

    TYPES = {
        AGE: "AGE",
        CHR: "CHR",
        INT: "INT",
        STR: "STR",
        MNY: "MNY",
        SPR: "SPR",
        LIF: "LIF",
        TLT: "TLT",
        EVT: "EVT",//事件列表
        P_EVT: "P_EVT",//本次（重修）事件列表
    };

    #ageData;
    #data;
    #record;

    initial({age}) {

        this.#ageData = age;
        for(const a in age) {
            let { event, talent } = age[a];
            if(!Array.isArray(event))
                event = event?.split(',') || [];

            event = event.map(v=>{
                const value = `${v}`.split('*').map(n=>Number(n));
                if(value.length==1) value.push(1);
                return value;
            });

            if(!Array.isArray(talent))
                talent = talent?.split(',') || [];

            talent = talent.map(v=>Number(v));

            age[a] = { event, talent };
        }
    }

    restart(data) {
        this.#data = {
            [this.TYPES.AGE]: -1,
            [this.TYPES.CHR]: 0,
            [this.TYPES.INT]: 0,
            [this.TYPES.STR]: 0,
            [this.TYPES.MNY]: 0,
            [this.TYPES.SPR]: 0,
            [this.TYPES.LIF]: 1,
            [this.TYPES.TLT]: [],
            [this.TYPES.EVT]: [],
            [this.TYPES.P_EVT]: [],
        };
        for(const key in data)
            this.change(key, data[key]);
        this.#record = [];
    }

    get(prop) {
        switch(prop) {
            case this.TYPES.AGE:
            case this.TYPES.CHR:
            case this.TYPES.INT:
            case this.TYPES.STR:
            case this.TYPES.MNY:
            case this.TYPES.SPR:
            case this.TYPES.LIF:
            case this.TYPES.TLT:
            case this.TYPES.EVT:
                return clone(this.#data[prop]);
            case this.TYPES.P_EVT:
                return clone(this.#data[prop]);
            default: return 0;
        }
    }

    set(prop, value) {
        switch(prop) {
            case this.TYPES.AGE:
            case this.TYPES.CHR:
            case this.TYPES.INT:
            case this.TYPES.STR:
            case this.TYPES.MNY:
            case this.TYPES.SPR:
            case this.TYPES.LIF:
            case this.TYPES.TLT:
            case this.TYPES.EVT:
                this.#data[prop] = clone(value);
                break;
            case this.TYPES.P_EVT:
                this.#data[prop] = clone(value);
                break;
            default: return 0;
        }
    }

    record() {
        this.#record.push({
            [this.TYPES.AGE]: this.get(this.TYPES.AGE),
            [this.TYPES.CHR]: this.get(this.TYPES.CHR),
            [this.TYPES.INT]: this.get(this.TYPES.INT),
            [this.TYPES.STR]: this.get(this.TYPES.STR),
            [this.TYPES.MNY]: this.get(this.TYPES.MNY),
            [this.TYPES.SPR]: this.get(this.TYPES.SPR),
        });
    }

    getRecord() {
        return clone(this.#record);
    }

    getLastRecord() {
        return clone(this.#record[this.#record.length - 1]);
    }

    change(prop, value) {
        if(Array.isArray(value)) {
            for(const v of value)
                this.change(prop, Number(v));
            return;
        }
        switch(prop) {
            case this.TYPES.AGE:
            case this.TYPES.CHR:
            case this.TYPES.INT:
            case this.TYPES.STR:
            case this.TYPES.MNY:
            case this.TYPES.SPR:
            case this.TYPES.LIF:
                this.#data[prop] += Number(value);
                break;
            case this.TYPES.TLT:
            case this.TYPES.EVT:
                const v = this.#data[prop];
                if(value<0) {
                    const index = v.indexOf(value);
                    if(index!=-1) v.splice(index,1);
                }
                if(!v.includes(value)) v.push(value);
                break;
            case this.TYPES.P_EVT:
                const pv = this.#data[prop];
                if(value<0) {
                    const index = pv.indexOf(value);
                    if(index!=-1) pv.splice(index,1);
                }
                if(!pv.includes(value)) pv.push(value);
                break;
            default: return;
        }
    }

    effect(effects) {
        for(const prop in effects)
            this.change(prop, Number(effects[prop]));
    }

    isEnd() {
        return this.get(this.TYPES.LIF) < 1;
    }

    ageNext() {

        const ageReStart = this.get(this.TYPES.AGE);
        //年龄重置为0时，清空本次（重修）事件列表
        //0岁事件为性别，可以不记录
        if(ageReStart == 0){
            this.set(this.TYPES.P_EVT, []);
        }
        this.change(this.TYPES.AGE, 1);
        const age = this.get(this.TYPES.AGE);
        //查看事件
        const evt = this.get(this.TYPES.EVT);
        const pevt = this.get(this.TYPES.P_EVT);

        const {event, talent} = this.getAgeData(age);
        return {age, event, talent};
    }

    getAgeData(age) {
        return clone(this.#ageData[age]);
    }

}

export default Property;