import React, { FC, Fragment } from 'react'
import { Helmet } from 'react-helmet'
import Block from '../Components/Block'
import './index.css'

type TBlock = {
    selector: string
    name: Numbers
    pitch: Numbers
}
type TBlocks = TBlock[]

type TSound = {
    name: 'correct' | 'wrong'
    sets: number[]
}

type TSoundData = TSound[]
enum Numbers {
    One = '1',
    Two = '2',
    Three = '3',
    Four = '4',
}
const blockData: TBlocks = [
    { selector: '.block1', name: Numbers.One, pitch: Numbers.One },
    { selector: '.block2', name: Numbers.Two, pitch: Numbers.Two },
    { selector: '.block3', name: Numbers.Three, pitch: Numbers.Three },
    { selector: '.block4', name: Numbers.Four, pitch: Numbers.Four },
]

const soundData: TSoundData = [
    { name: 'correct', sets: [1, 3, 5, 8] },
    { name: 'wrong', sets: [2, 4, 5.5, 7] },
]

class Blocks {
    blocks: {
        name: string
        el: Element
        audio: HTMLAudioElement
    }[]

    soundSets: {
        name: string
        sets: HTMLAudioElement[]
    }[]

    allOn = false

    constructor(blockAssign: TBlocks, soundAssign: TSoundData) {
        this.blocks = blockAssign.map(data => ({
            name: data.name,
            el: document.querySelector(data.selector) as Element,
            audio: this.getAudioObject(data.pitch),
        }))

        this.soundSets = soundAssign.map(data => ({
            name: data.name,
            sets: data.sets.map(pitch => this.getAudioObject(pitch)),
        }))
    }

    getAudioObject = (pitch: string | number) => {
        return new Audio(`https://awiclass.monoame.com/pianosound/set/${pitch}.wav`)
    }

    flashAndPlayAudio = (note: string) => {
        const block = this.blocks.find(data => data.name === note)

        if (block?.el) {
            block.el.classList.add('light')
            block.audio.currentTime = 0
            block.audio.play()

            setTimeout(() => {
                if (!this.allOn) block.el.classList.remove('light')
            }, 100)
        }
    }

    turnAllOn = () => {
        this.allOn = true

        this.blocks.forEach(block => {
            block.el.classList.add('light')
        })
    }

    turnAllOff = () => {
        this.allOn = false

        this.blocks.forEach(block => {
            block.el.classList.remove('light')
        })
    }

    playSet = (type: string) => {
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const sets = this.soundSets.find(obj => obj.name === type)!.sets

        sets.forEach(obj => {
            obj.currentTime = 0
            obj.play()
        })
    }
}

class MemoryGame {
    blocks = new Blocks(blockData, soundData)
    wrapElement = document.querySelector('.wrap') as Element
    statusElement = document.querySelector('.status') as Element
    blockElements = document.querySelectorAll('.block')
    circleElements = document.querySelectorAll('.circle')
    inputProgressElement = document.querySelector('.inputProgress') as Element
    endWindowElement = document.querySelector('.endWindow') as Element
    memoryLevelElement = document.querySelector('.memoryLevel') as Element
    restartElement = document.querySelector('.restart') as Element
    levelString = '1234'
    currentLevel = 0
    replayTimes = 0
    playInterval = 400
    mode = 'Waiting'
    userInput = ''
    timer!: NodeJS.Timeout
    constructor() {
        this.events()
    }

    events = () => {
        setTimeout(() => {
            this.startNewLevel()
        }, 1000)

        this.blockElements.forEach(el => {
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            el.addEventListener('click', (e: any) => {
                //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.checkInputs(e.target!.id)
            })
        })

        this.restartElement.addEventListener('click', () => {
            this.wrapElement.classList.remove('blur')
            this.endWindowElement.classList.add('hide')
            this.startNewLevel()
        })
    }

    startNewLevel = () => {
        this.replayTimes = 1

        if (this.currentLevel === 0) {
            this.levelString = '1234'
            this.statusElement.textContent = 'Click in the flashing order'
        } else {
            for (let i = 0; i < 2; i++) {
                this.levelString += this.createRandomNumber(1, 4)
            }
            this.statusElement.textContent = `Memory Level: ${this.currentLevel}`
        }

        console.clear()
        console.log(`currentLevel: ${this.currentLevel}`)
        console.log(`levelString: '${this.levelString}'`)
        this.startListening()
    }

    createRandomNumber = (a: number, b: number) => {
        return Math.floor(Math.random() * b) + a
    }

    startListening = () => {
        this.mode = 'Listening'

        this.blockElements.forEach(el => {
            el.classList.add('stopInputting')
        })

        this.showinputProgressCircles('')

        const notesArray = this.levelString.split('')

        this.timer = setInterval(() => {
            const note = notesArray.shift()

            if (!notesArray.length) {
                clearInterval(this.timer)

                setTimeout(() => {
                    this.startInputting()
                }, this.playInterval)
            }

            if (note) this.blocks.flashAndPlayAudio(note)
        }, this.playInterval)
    }

    startInputting = () => {
        this.mode = 'Inputting'

        this.blockElements.forEach(el => {
            el.classList.remove('stopInputting')
        })

        this.userInput = ''
    }

    checkInputs = (inputChar: string) => {
        if (this.mode === 'Inputting') {
            const tempString = this.userInput + inputChar

            this.userInput += inputChar
            this.showinputProgressCircles(tempString)
            this.blocks.flashAndPlayAudio(inputChar)

            if (this.levelString.indexOf(tempString) === 0) {
                if (tempString === this.levelString) {
                    this.gameContinue()
                }
            } else {
                this.replayTimes > 0 ? this.replayCurrentLevel() : this.gameOver()
            }
        }
    }

    showinputProgressCircles = (tempString: string) => {
        if (this.inputProgressElement) this.inputProgressElement.innerHTML = ''

        this.levelString.split('').forEach((data, index) => {
            this.inputProgressElement.innerHTML += `
				<div class="circle${index < tempString.length ? ' correct' : ''}"></div>`
        })

        this.inputProgressElement.classList.remove('correct', 'wrong')

        if (tempString === this.levelString) {
            setTimeout(() => {
                this.inputProgressElement.classList.add('correct')
            }, this.playInterval)
        }

        if (this.levelString.indexOf(tempString) !== 0) {
            this.inputProgressElement.classList.add('wrong')
        }
    }

    gameContinue = () => {
        this.replayTimes = 1
        this.currentLevel += 1
        this.mode = 'Waiting'

        setTimeout(() => {
            this.blocks.turnAllOn()
            this.blocks.playSet('correct')
            this.statusElement.textContent = 'Correct!'
        }, this.playInterval)

        setTimeout(() => {
            this.blocks.turnAllOff()
        }, this.playInterval * 2)

        setTimeout(() => {
            this.startNewLevel()
        }, this.playInterval + 600)
    }

    replayCurrentLevel = () => {
        this.replayTimes -= 1
        this.mode = 'Waiting'
        this.blocks.turnAllOn()
        this.blocks.playSet('wrong')

        setTimeout(() => {
            this.blocks.turnAllOff()
        }, this.playInterval)

        setTimeout(() => {
            if (this.currentLevel === 0) {
                this.statusElement.textContent = 'Click in the flashing order'
            } else {
                this.statusElement.textContent = `Memory Level: ${this.currentLevel}`
            }

            this.startListening()
        }, this.playInterval + 600)
    }

    gameOver = () => {
        this.mode = 'Waiting'
        this.blocks.turnAllOn()
        this.blocks.playSet('wrong')

        setTimeout(() => {
            this.inputProgressElement.innerHTML = ''
            this.blocks.turnAllOff()
            this.wrapElement.classList.add('blur')
            this.endWindowElement.classList.remove('hide')

            if (this.currentLevel <= 1) {
                this.memoryLevelElement.textContent = `Oops! You didn't accomplish any level.`
            } else {
                this.memoryLevelElement.textContent = `Your Memory Level: ${
                    this.currentLevel - 1
                }`
            }

            this.currentLevel = 0
        }, this.playInterval)
    }
}

const App: FC = () => {
    return (
        <Fragment>
            <Helmet>
                <meta
                    content="width=device-width"
                    initial-scale="1"
                    maximum-scale="1"
                    name="viewport"
                />
            </Helmet>
            <div className="wrap">
                <div className="infos">
                    <h1 className="title">Memory Bloxx</h1>
                    <h2 className="status">How to ?</h2>
                </div>
                <div className="columns">
                    <div className="row">
                        <Block id="1" name="block1" />
                        <Block id="2" name="block2" />
                    </div>
                    <div className="row">
                        <Block id="3" name="block3" />
                        <Block id="4" name="block4" />
                    </div>
                    <div className="row">
                        <div className="inputProgress">
                            <div className="circle" />
                            <div className="circle" />
                            <div className="circle" />
                            <div className="circle" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="endWindow hide">
                <div className="memoryLevel" />
                <div className="restart">Try Again</div>
            </div>
        </Fragment>
    )
}

window.onload = () => {
    new MemoryGame()
}

export default App
