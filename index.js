#!/usr/bin/env node
import { promisify } from 'node:util';
import stream from 'node:stream';
import ProgressBar from 'progress'
import fs from 'node:fs';
import got from 'got';
import chalk from 'chalk';
const log = console.log;
const downloadUrl = process.argv[2]

if (downloadUrl) {

    const pointArr = downloadUrl.split('.')
    let suffix = pointArr[pointArr.length - 1]
    suffix = suffix.indexOf('?') !== -1 ? suffix.slice(0, suffix.indexOf('?')) : suffix
    const pathArr = pointArr[pointArr.length - 2].split('/')
    const filename = pathArr[pathArr.length - 1]

    const pipeline = promisify(stream.pipeline);
    const readStream = got.stream(downloadUrl)
    if(!filename || !suffix) {
        log(chalk.red('暂时只支持文件名结尾的url地址！'))
    }
    const onError = (err) => {
        log(chalk.red('download failed'));
        console.log(err)
    }
    readStream.on('response', async res => {

        let file = filename + '.' + suffix
        try {
            await pipeline(
                readStream,
                fs.createWriteStream(file)
            );
            log(chalk.green('download success！！！'));
            log(chalk.green('filename:' + file));
        } catch (error) {

            onError(error);
        }

    })
    readStream.off('error', onError);
    readStream.on('downloadProgress', async progress => {
        let bar = new ProgressBar('  downloading [:bar] :percent', {
            complete: '+',
            incomplete: ' ',
            width: 40,
            total: progress.total,
            renderThrottle: 16
        });
        bar.tick(progress.transferred);

    })

} else {
    log(chalk.red('请输入有效的文件地址！'))
}
