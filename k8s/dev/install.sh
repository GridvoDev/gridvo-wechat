#!/bin/bash
kubectl get svc | grep -q gridvo-wechat
if [ "$?" == "1" ];then
	kubectl create -f gridvo_wechat-service.yaml --record
	kubectl get svc | grep -q gridvo-wechat
	if [ "$?" == "0" ];then
		echo "gridvo_wechat-service install success!"
	else
		echo "gridvo_wechat-service install fail!"
	fi
else
	echo "gridvo_wechat-service is exist!"
fi
kubectl get pods | grep -q gridvo-wechat
if [ "$?" == "1" ];then
	kubectl create -f gridvo_wechat-deployment.yaml --record
	kubectl get pods | grep -q gridvo-wechat
	if [ "$?" == "0" ];then
		echo "gridvo_wechat-deployment install success!"
	else
		echo "gridvo_wechat-deployment install fail!"
	fi
else
	kubectl delete -f gridvo_wechat-deployment.yaml
	kubectl get pods | grep -q gridvo-wechat
	while [ "$?" == "0" ]
	do
	kubectl get pods | grep -q gridvo-wechat
	done
	kubectl delete -f gridvo_wechat-deployment.yaml
	kubectl create -f gridvo_wechat-deployment.yaml --record
	kubectl get pods | grep -q gridvo-wechat
	if [ "$?" == "0" ];then
		echo "gridvo_wechat-deployment update success!"
	else
		echo "gridvo_wechat-deployment update fail!"
	fi
fi